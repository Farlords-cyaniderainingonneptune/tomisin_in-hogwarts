import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { HOUSES, INITIAL_SPELLS, INITIAL_INVENTORY_ITEMS, SHOP_SPELLS, FOREST_QUEST_ENEMIES } from './src/data/gameData';
import { getRandomSortingQuestions } from './src/data/sortingHatQuestions';
import { GameRoom, Player, HouseId, Spell, InventoryItem, CombatState, BattleLogEntry, Enemy } from './src/types/game';
import {
  initDatabase,
  savePlayer,
  saveGameRoom,
  saveUserSpell,
  saveUserAbility,
  getDatabaseSummary,
  registerAdminRecord,
  verifyAdminStatus,
  BOOTSTRAP_ADMIN_EMAIL,
} from './server/db';

// ES Module __dirname shim (required when bundled with esbuild)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// 1. Configure Socket.io with dynamic Render origin handling
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// 2. Use dynamic PORT injected by Render environment
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Firestore Database
initDatabase();

// Database inspection endpoint - strictly protected for verified Hogwarts administrators
app.get('/api/database', async (req, res) => {
  const adminUid = (req.query.uid as string) || (req.headers['x-admin-uid'] as string);
  const adminEmail = (req.query.email as string) || (req.headers['x-admin-email'] as string);

  const summary = await getDatabaseSummary({ uid: adminUid, email: adminEmail });
  if (summary.status === 'unauthorized') {
    return res.status(403).json(summary);
  }
  res.json(summary);
});

// Admin status verification endpoint
app.get('/api/admin/status', async (req, res) => {
  const uid = (req.query.uid as string) || (req.headers['x-admin-uid'] as string);
  const email = (req.query.email as string) || (req.headers['x-admin-email'] as string);

  const result = await verifyAdminStatus(uid, email);
  res.json({
    isAdmin: result.isAdmin,
    role: result.role || null,
    bootstrapEmail: BOOTSTRAP_ADMIN_EMAIL,
  });
});

// Admin account registration endpoint
app.post('/api/admin/register', async (req, res) => {
  const { uid, email, displayName, secretPasscode } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ success: false, error: 'UID and email are required for admin registration.' });
  }

  const isBootstrap = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  // If not the bootstrap admin, require the Hogwarts secret passcode
  const REQUIRED_PASSCODE = 'HOGWARTS27';
  if (!isBootstrap && secretPasscode !== REQUIRED_PASSCODE) {
    return res.status(403).json({
      success: false,
      error: 'Invalid Hogwarts High Inquisitor Secret Passcode. Only authorized personnel can create admin accounts.',
    });
  }

  const result = await registerAdminRecord({
    uid,
    email,
    displayName,
    role: isBootstrap ? 'super_admin' : 'admin',
  });

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    message: `Admin account granted: ${email}`,
    admin: result.admin,
  });
});

// In-memory gamerooms
const rooms: Record<string, GameRoom> = {};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function cloneEnemies(waveNumber: 1 | 2 | 3): Enemy[] {
  const waveData = FOREST_QUEST_ENEMIES.find((w) => w.wave === waveNumber);
  if (!waveData) return [];
  return JSON.parse(JSON.stringify(waveData.enemies));
}

function initCombat(room: GameRoom, wave: 1 | 2 | 3 = 1): CombatState {
  const enemies = cloneEnemies(wave);
  const waveName = FOREST_QUEST_ENEMIES.find((w) => w.wave === wave)?.name || `Wave ${wave}`;

  const participants: { id: string; initRoll: number }[] = [];

  Object.values(room.players).forEach((p) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    participants.push({ id: p.id, initRoll: roll + (p.stats.agi || 10) });
  });

  enemies.forEach((e) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    participants.push({ id: e.id, initRoll: roll + e.speed });
  });

  participants.sort((a, b) => b.initRoll - a.initRoll);
  const turnOrder = participants.map((p) => p.id);

  const initialLog: BattleLogEntry = {
    id: `log_${Date.now()}_init`,
    timestamp: Date.now(),
    turnNumber: 1,
    actorName: 'Hogwarts Narrator',
    actorType: 'system',
    actionName: 'Battle Commenced',
    description: `The party ventures into the cursed woods! Entering ${waveName}. Ready your wands!`,
  };

  return {
    wave,
    maxWaves: 3,
    waveName,
    phase: 'player_turn',
    turnOrder,
    currentTurnIndex: 0,
    currentActorId: turnOrder[0] || '',
    enemies,
    turnCount: 1,
    battleLog: [initialLog],
  };
}

function executeEnemyTurn(room: GameRoom, enemyId: string) {
  if (!room.combatState) return;
  const enemy = room.combatState.enemies.find((e) => e.id === enemyId);
  if (!enemy || enemy.hp <= 0) {
    advanceCombatTurn(room);
    return;
  }

  const alivePlayers = Object.values(room.players).filter((p) => p.hp > 0);
  if (alivePlayers.length === 0) {
    room.combatState.phase = 'defeat';
    room.combatState.battleLog.unshift({
      id: `log_${Date.now()}_defeat`,
      timestamp: Date.now(),
      turnNumber: room.combatState.turnCount,
      actorName: 'The Evil Forest',
      actorType: 'system',
      actionName: 'Party Defeated',
      description: 'All wizards have fallen to the dark forces of the Evil Forest!',
    });
    io.to(room.code).emit('room_updated', room);
    return;
  }

  const targetPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

  let damage = enemy.attackPower;
  let actionName = 'Dark Attack';
  let actionDesc = `${enemy.name} strikes ${targetPlayer.name}!`;

  if (enemy.abilities && enemy.abilities.length > 0) {
    const ability = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
    if (ability.targetType === 'all_enemies') {
      const dmg = ability.damage || 20;
      alivePlayers.forEach((p) => {
        const finalDmg = p.isDefending ? Math.floor(dmg * 0.5) : dmg;
        p.hp = Math.max(0, p.hp - finalDmg);
      });
      actionName = ability.name;
      actionDesc = `${enemy.name} unleashed ${ability.name} across the whole party, dealing ${dmg} damage!`;
    } else {
      damage = ability.damage || enemy.attackPower;
      actionName = ability.name;
      const finalDmg = targetPlayer.isDefending ? Math.floor(damage * 0.5) : damage;
      targetPlayer.hp = Math.max(0, targetPlayer.hp - finalDmg);
      actionDesc = `${enemy.name} used ${ability.name} on ${targetPlayer.name} for ${finalDmg} damage!`;
    }
  } else {
    const finalDmg = targetPlayer.isDefending ? Math.floor(damage * 0.5) : damage;
    targetPlayer.hp = Math.max(0, targetPlayer.hp - finalDmg);
    actionDesc = `${enemy.name} attacks ${targetPlayer.name} for ${finalDmg} damage!`;
  }

  room.combatState.battleLog.unshift({
    id: `log_${Date.now()}_enemy`,
    timestamp: Date.now(),
    turnNumber: room.combatState.turnCount,
    actorName: enemy.name,
    actorType: 'enemy',
    actionName,
    targetName: targetPlayer.name,
    description: actionDesc,
    damage,
  });

  const remainingPlayers = Object.values(room.players).filter((p) => p.hp > 0);
  if (remainingPlayers.length === 0) {
    room.combatState.phase = 'defeat';
  } else {
    advanceCombatTurn(room);
  }

  io.to(room.code).emit('room_updated', room);
}

function advanceCombatTurn(room: GameRoom) {
  if (!room.combatState) return;
  const combat = room.combatState;

  const aliveEnemies = combat.enemies.filter((e) => e.hp > 0);
  if (aliveEnemies.length === 0) {
    if (combat.wave < 3) {
      const nextWave = (combat.wave + 1) as 2 | 3;
      combat.wave = nextWave;
      combat.enemies = cloneEnemies(nextWave);
      combat.waveName = FOREST_QUEST_ENEMIES.find((w) => w.wave === nextWave)?.name || `Wave ${nextWave}`;
      
      Object.values(room.players).forEach((p) => {
        p.sp += 30;
        p.gold += 50;
        p.mp = Math.min(p.maxMp, p.mp + 25);
      });

      combat.battleLog.unshift({
        id: `log_${Date.now()}_wave_clear`,
        timestamp: Date.now(),
        turnNumber: combat.turnCount,
        actorName: 'Hogwarts TTRPG',
        actorType: 'system',
        actionName: 'Wave Cleared!',
        description: `Wave cleared! Each player received +30 Spell Points, +50 Galleons, and restored 25 MP! Now entering ${combat.waveName}!`,
      });

      const participants: { id: string; initRoll: number }[] = [];
      Object.values(room.players).forEach((p) => {
        if (p.hp > 0) {
          participants.push({ id: p.id, initRoll: Math.floor(Math.random() * 20) + (p.stats.agi || 10) });
        }
      });
      combat.enemies.forEach((e) => {
        participants.push({ id: e.id, initRoll: Math.floor(Math.random() * 20) + e.speed });
      });
      participants.sort((a, b) => b.initRoll - a.initRoll);
      combat.turnOrder = participants.map((p) => p.id);
      combat.currentTurnIndex = 0;
      combat.currentActorId = combat.turnOrder[0] || '';
      return;
    } else {
      combat.phase = 'victory';
      room.stage = 'victory';
      combat.battleLog.unshift({
        id: `log_${Date.now()}_victory`,
        timestamp: Date.now(),
        turnNumber: combat.turnCount,
        actorName: 'Birthday Triumph',
        actorType: 'system',
        actionName: 'VICTORY!',
        description: 'THE EVIL BABALAWO HAS BEEN DEFEATED! Tomisin and her Hogwarts squad saved the realm for her 27th Birthday celebration!',
      });
      return;
    }
  }

  let nextIdx = (combat.currentTurnIndex + 1) % combat.turnOrder.length;
  let attempts = 0;

  while (attempts < combat.turnOrder.length) {
    const candidateId = combat.turnOrder[nextIdx];
    const isPlayer = room.players[candidateId];
    const isEnemy = combat.enemies.find((e) => e.id === candidateId);

    if (isPlayer && isPlayer.hp > 0) {
      combat.currentTurnIndex = nextIdx;
      combat.currentActorId = candidateId;
      isPlayer.isDefending = false;
      if (isPlayer.abilityCooldown > 0) isPlayer.abilityCooldown--;
      combat.turnCount++;
      return;
    }

    if (isEnemy && isEnemy.hp > 0) {
      combat.currentTurnIndex = nextIdx;
      combat.currentActorId = candidateId;
      combat.turnCount++;

      setTimeout(() => {
        executeEnemyTurn(room, candidateId);
      }, 1200);
      return;
    }

    nextIdx = (nextIdx + 1) % combat.turnOrder.length;
    attempts++;
  }
}

// Socket.io handlers
io.on('connection', (socket: Socket) => {
  let currentRoomCode: string | null = null;
  let currentPlayerId: string | null = null;

  socket.on('create_room', ({ hostName, avatarUrl }: { hostName: string; avatarUrl: string }) => {
    const code = generateRoomCode();
    const playerId = socket.id;
    const partyName = `${hostName || 'Tomisin'}'s Birthday Squad`;
    const partyLink = `?room=${code}`;

    // Pick 5 random questions with randomized options for this ceremony
    const randomQuestions = getRandomSortingQuestions(5);

    const hostPlayer: Player = {
      id: playerId,
      name: hostName || 'Wandering Wizard',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      isHost: true,
      isReady: false,
      house: null,
      hp: 100,
      maxHp: 100,
      mp: 80,
      maxMp: 80,
      sp: 100,
      gold: 150,
      stats: { str: 12, int: 14, agi: 13, def: 10 },
      specialAbility: null,
      abilityCooldown: 0,
      spells: [...INITIAL_SPELLS],
      inventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY_ITEMS)),
      equipped: {},
      statusEffects: [],
      partyName,
      partyLink,
      sortingQuestions: randomQuestions,
    };

    const newRoom: GameRoom = {
      code,
      name: partyName,
      hostId: playerId,
      maxPlayers: 5,
      stage: 'lobby',
      players: { [playerId]: hostPlayer },
      combatState: null,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: 'system',
          senderName: 'Hogwarts Registry',
          text: `Welcome to ${partyName}! Room code is ${code}. Share link: ${partyLink}`,
          timestamp: Date.now(),
          type: 'system',
        },
      ],
      createdAt: Date.now(),
      partyName,
      partyLink,
      sortingQuestions: randomQuestions,
    };

    rooms[code] = newRoom;
    currentRoomCode = code;
    currentPlayerId = playerId;

    // Persist host player and gameroom/party to database
    savePlayer(hostPlayer, code, partyName, partyLink);
    saveGameRoom(newRoom, partyLink);

    socket.join(code);
    socket.emit('room_joined', { room: newRoom, playerId });
  });

  socket.on('join_room', ({ code, playerName, avatarUrl }: { code: string; playerName: string; avatarUrl: string }) => {
    const upperCode = (code || '').toUpperCase().trim();
    const room = rooms[upperCode];

    if (!room) {
      socket.emit('error_message', 'Room not found! Check the room code.');
      return;
    }

    if (Object.keys(room.players).length >= room.maxPlayers) {
      socket.emit('error_message', 'This room is full (max 5 players).');
      return;
    }

    const playerId = socket.id;
    const newPlayer: Player = {
      id: playerId,
      name: playerName || `Wizard ${Object.keys(room.players).length + 1}`,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      isHost: false,
      isReady: false,
      house: null,
      hp: 100,
      maxHp: 100,
      mp: 80,
      maxMp: 80,
      sp: 100,
      gold: 150,
      stats: { str: 12, int: 14, agi: 13, def: 10 },
      specialAbility: null,
      abilityCooldown: 0,
      spells: [...INITIAL_SPELLS],
      inventory: JSON.parse(JSON.stringify(INITIAL_INVENTORY_ITEMS)),
      equipped: {},
      statusEffects: [],
      partyName: room.partyName || room.name,
      partyLink: room.partyLink || `?room=${upperCode}`,
      sortingQuestions: room.sortingQuestions,
    };

    room.players[playerId] = newPlayer;
    currentRoomCode = upperCode;
    currentPlayerId = playerId;

    room.messages.push({
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'Hogwarts Registry',
      text: `${newPlayer.name} has arrived at the Hogwarts Great Hall!`,
      timestamp: Date.now(),
      type: 'system',
    });

    // Persist joined player and updated room to database
    savePlayer(newPlayer, upperCode, room.partyName, room.partyLink);
    saveGameRoom(room, room.partyLink || `?room=${upperCode}`);

    socket.join(upperCode);
    socket.emit('room_joined', { room, playerId });
    io.to(upperCode).emit('room_updated', room);
  });

  socket.on('start_sorting_ceremony', () => {
    if (!currentRoomCode) return;
    const room = rooms[currentRoomCode];
    if (!room) return;

    // Refresh random 5 questions with randomized answer option positions
    room.sortingQuestions = getRandomSortingQuestions(5);
    Object.values(room.players).forEach((p) => {
      p.sortingQuestions = room.sortingQuestions;
    });

    room.stage = 'sorting';
    room.messages.push({
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'The Sorting Hat',
      text: 'The enchanted Sorting Hat takes center stage! 5 mystery questions selected from the archives, options randomized!',
      timestamp: Date.now(),
      type: 'system',
    });

    saveGameRoom(room, room.partyLink || `?room=${room.code}`);
    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('submit_sorting_answers', ({ houseId }: { houseId: HouseId }) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = rooms[currentRoomCode];
    if (!room) return;

    const player = room.players[currentPlayerId];
    if (!player) return;

    const houseInfo = HOUSES[houseId];
    if (!houseInfo) return;

    player.house = houseId;
    player.hp = houseInfo.baseHp;
    player.maxHp = houseInfo.baseHp;
    player.mp = houseInfo.baseMp;
    player.maxMp = houseInfo.baseMp;
    player.sp = houseInfo.baseSp;
    player.specialAbility = houseInfo.specialAbility;

    if (houseId === 'gryffindor') {
      player.stats = { str: 16, int: 12, agi: 14, def: 14 };
    } else if (houseId === 'ravenclaw') {
      player.stats = { str: 10, int: 18, agi: 15, def: 10 };
    } else if (houseId === 'hufflepuff') {
      player.stats = { str: 13, int: 14, agi: 12, def: 16 };
    } else if (houseId === 'slytherin') {
      player.stats = { str: 14, int: 16, agi: 16, def: 11 };
    }

    room.messages.push({
      id: `msg_${Date.now()}`,
      senderId: player.id,
      senderName: 'The Sorting Hat',
      senderAvatar: player.avatarUrl,
      senderHouse: houseId,
      text: `⚡ GRANDE ANNOUNCEMENT! ${player.name} is sorted into ${houseInfo.name.toUpperCase()}! Special Ability Granted: "${houseInfo.specialAbility.name}"!`,
      timestamp: Date.now(),
      type: 'system',
    });

    // Save player profile and house ability to database
    savePlayer(player, room.code, room.partyName, room.partyLink);
    saveUserAbility(player, houseId);

    const allSorted = Object.values(room.players).every((p) => p.house !== null);
    if (allSorted) {
      room.stage = 'common_room';
    }

    saveGameRoom(room, room.partyLink || `?room=${room.code}`);
    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('enter_common_room_direct', () => {
    if (!currentRoomCode) return;
    const room = rooms[currentRoomCode];
    if (!room) return;
    room.stage = 'common_room';
    saveGameRoom(room, room.partyLink || `?room=${room.code}`);
    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('buy_spell', ({ spellId }: { spellId: string }) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = rooms[currentRoomCode];
    if (!room) return;
    const player = room.players[currentPlayerId];
    if (!player) return;

    const spell = SHOP_SPELLS.find((s) => s.id === spellId);
    if (!spell) return;

    if (player.spells.some((s) => s.id === spellId)) {
      socket.emit('error_message', 'You already learned this spell!');
      return;
    }

    if (player.sp < spell.costSp) {
      socket.emit('error_message', `Not enough Spell Points (SP)! Need ${spell.costSp} SP.`);
      return;
    }

    player.sp -= spell.costSp;
    player.spells.push(spell);

    room.messages.push({
      id: `msg_${Date.now()}`,
      senderId: player.id,
      senderName: player.name,
      senderHouse: player.house,
      text: `✨ Learned the ancient spell [${spell.name}] for ${spell.costSp} SP!`,
      timestamp: Date.now(),
      type: 'loot',
    });

    // Persist spell purchase and updated player to database
    saveUserSpell(player, spell);
    savePlayer(player, room.code, room.partyName, room.partyLink);

    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('toggle_ready', () => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = rooms[currentRoomCode];
    if (!room) return;
    const player = room.players[currentPlayerId];
    if (!player) return;

    player.isReady = !player.isReady;
    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('start_quest', () => {
    if (!currentRoomCode) return;
    const room = rooms[currentRoomCode];
    if (!room) return;

    room.stage = 'quest_forest';
    room.combatState = initCombat(room, 1);

    room.messages.push({
      id: `msg_${Date.now()}`,
      senderId: 'system',
      senderName: 'Quest Dispatch',
      text: '🌲 The Hogwarts party embarks into the Forbidden Evil Forest to defeat the Evil Babalawo and his beasts!',
      timestamp: Date.now(),
      type: 'system',
    });

    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('player_action', ({ actionType, spellId, targetId, itemId }: { actionType: 'wand_attack' | 'spell' | 'ability' | 'defend' | 'use_item'; spellId?: string; targetId?: string; itemId?: string }) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = rooms[currentRoomCode];
    if (!room || !room.combatState) return;

    const combat = room.combatState;
    if (combat.currentActorId !== currentPlayerId) {
      socket.emit('error_message', "It is not your turn yet!");
      return;
    }

    const player = room.players[currentPlayerId];
    if (!player || player.hp <= 0) return;

    const targetEnemy = combat.enemies.find((e) => e.id === targetId && e.hp > 0) || combat.enemies.find((e) => e.hp > 0);
    const targetAlly = targetId ? room.players[targetId] : player;

    const d20 = Math.floor(Math.random() * 20) + 1;
    const isCrit = d20 === 20;

    if (actionType === 'wand_attack') {
      if (!targetEnemy) return;
      const baseDmg = 16 + Math.floor((player.stats.str || 10) / 2);
      const critMultiplier = isCrit ? 2.0 : (d20 >= 15 ? 1.25 : 1.0);
      const finalDmg = Math.floor(baseDmg * critMultiplier);

      targetEnemy.hp = Math.max(0, targetEnemy.hp - finalDmg);

      combat.battleLog.unshift({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        turnNumber: combat.turnCount,
        actorName: player.name,
        actorType: 'player',
        actionName: 'Wand Spark Blast',
        targetName: targetEnemy.name,
        description: `${player.name} rolls a [D20: ${d20}] and blasts ${targetEnemy.name} for ${finalDmg} damage! ${isCrit ? '💥 CRITICAL HIT!' : ''}`,
        damage: finalDmg,
        isCritical: isCrit,
        d20Roll: d20,
      });

      advanceCombatTurn(room);
    } else if (actionType === 'spell') {
      const spell = player.spells.find((s) => s.id === spellId);
      if (!spell) return;

      if (player.mp < spell.mpCost) {
        socket.emit('error_message', `Not enough MP! Requires ${spell.mpCost} MP.`);
        return;
      }

      player.mp -= spell.mpCost;
      const critMultiplier = isCrit ? 2.0 : 1.0;

      if (spell.targetType === 'all_enemies') {
        const dmg = Math.floor((spell.damage || 20) * critMultiplier);
        combat.enemies.forEach((e) => {
          if (e.hp > 0) {
            e.hp = Math.max(0, e.hp - dmg);
          }
        });
        if (spell.healing) {
          Object.values(room.players).forEach((p) => {
            p.hp = Math.min(p.maxHp, p.hp + spell.healing!);
          });
        }
        combat.battleLog.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          turnNumber: combat.turnCount,
          actorName: player.name,
          actorType: 'player',
          actionName: spell.name,
          description: `${player.name} casts [${spell.name}] (D20: ${d20}), striking all enemies for ${dmg} damage!`,
          damage: dmg,
          isCritical: isCrit,
          d20Roll: d20,
        });
      } else if (spell.targetType === 'single_ally' || spell.healing) {
        const healAmt = Math.floor((spell.healing || 30) * critMultiplier);
        if (targetAlly) {
          targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + healAmt);
        }
        combat.battleLog.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          turnNumber: combat.turnCount,
          actorName: player.name,
          actorType: 'player',
          actionName: spell.name,
          targetName: targetAlly?.name,
          description: `${player.name} casts [${spell.name}] on ${targetAlly?.name}, restoring ${healAmt} HP!`,
          healing: healAmt,
          d20Roll: d20,
        });
      } else {
        if (!targetEnemy) return;
        const dmg = Math.floor(((spell.damage || 25) + Math.floor((player.stats.int || 12) / 3)) * critMultiplier);
        targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);

        combat.battleLog.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          turnNumber: combat.turnCount,
          actorName: player.name,
          actorType: 'player',
          actionName: spell.name,
          targetName: targetEnemy.name,
          description: `${player.name} casts [${spell.name}] at ${targetEnemy.name} dealing ${dmg} damage! ${isCrit ? '💥 CRITICAL CAST!' : ''}`,
          damage: dmg,
          isCritical: isCrit,
          d20Roll: d20,
        });
      }

      advanceCombatTurn(room);
    } else if (actionType === 'ability') {
      const ability = player.specialAbility;
      if (!ability) return;

      if (player.abilityCooldown > 0) {
        socket.emit('error_message', `Ability on cooldown (${player.abilityCooldown} turns left)!`);
        return;
      }

      if (player.mp < ability.mpCost) {
        socket.emit('error_message', `Not enough MP! Requires ${ability.mpCost} MP.`);
        return;
      }

      player.mp -= ability.mpCost;
      player.abilityCooldown = ability.cooldownTurns;

      if (ability.effectType === 'damage_buff') {
        if (targetEnemy) {
          targetEnemy.hp = Math.max(0, targetEnemy.hp - 35);
        }
        combat.battleLog.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          turnNumber: combat.turnCount,
          actorName: player.name,
          actorType: 'player',
          actionName: ability.name,
          targetName: targetEnemy?.name,
          description: `🦁 ${player.name} unleashes [${ability.name}] dealing 35 Fire damage and empowering the party!`,
          damage: 35,
        });
      } else if (ability.effectType === 'mana_crit') {
        player.mp = Math.min(player.maxMp, player.mp + 40);
        combat.battleLog.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          turnNumber: combat.turnCount,
          actorName: player.name,
          actorType: 'player',
          actionName: ability.name,
          description: `🦅 ${player.name} activates [${ability.name}], channeling starlight to restore 40 MP and overcharge spell crit!`,
          healing: 40,
        });
      } else if (ability.effectType === 'party_heal_shield') {
        Object.values(room.players).forEach((p) => {
          p.hp = Math.min(p.maxHp, p.hp + 40);
        });
        combat.battleLog.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          turnNumber: combat.turnCount,
          actorName: player.name,
          actorType: 'player',
          actionName: ability.name,
          description: `🦡 ${player.name} channels [${ability.name}], enveloping all allies in a 40 HP healing aura & golden barrier!`,
          healing: 40,
        });
      } else if (ability.effectType === 'poison_drain') {
        if (targetEnemy) {
          targetEnemy.hp = Math.max(0, targetEnemy.hp - 30);
          player.hp = Math.min(player.maxHp, player.hp + 25);
        }
        combat.battleLog.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          turnNumber: combat.turnCount,
          actorName: player.name,
          actorType: 'player',
          actionName: ability.name,
          targetName: targetEnemy?.name,
          description: `🐍 ${player.name} strikes with [${ability.name}], draining 30 HP from ${targetEnemy?.name} and restoring 25 HP!`,
          damage: 30,
          healing: 25,
        });
      }

      advanceCombatTurn(room);
    } else if (actionType === 'defend') {
      player.isDefending = true;
      combat.battleLog.unshift({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        turnNumber: combat.turnCount,
        actorName: player.name,
        actorType: 'player',
        actionName: 'Magical Defense',
        description: `${player.name} raises an enchanted wand barrier, halving all incoming damage until next turn!`,
      });
      advanceCombatTurn(room);
    } else if (actionType === 'use_item') {
      const itemIdx = player.inventory.findIndex((i) => i.id === itemId);
      if (itemIdx === -1) return;
      const item = player.inventory[itemIdx];

      if (item.hpRestore) {
        player.hp = Math.min(player.maxHp, player.hp + item.hpRestore);
      }
      if (item.mpRestore) {
        player.mp = Math.min(player.maxMp, player.mp + item.mpRestore);
      }

      item.quantity--;
      if (item.quantity <= 0) {
        player.inventory.splice(itemIdx, 1);
      }

      combat.battleLog.unshift({
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        turnNumber: combat.turnCount,
        actorName: player.name,
        actorType: 'player',
        actionName: `Used ${item.name}`,
        description: `${player.name} consumed [${item.name}], restoring ${item.hpRestore || 0} HP and ${item.mpRestore || 0} MP!`,
        healing: item.hpRestore,
      });

      advanceCombatTurn(room);
    }

    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('send_chat', ({ text }: { text: string }) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const room = rooms[currentRoomCode];
    if (!room) return;
    const player = room.players[currentPlayerId];
    if (!player) return;

    room.messages.push({
      id: `msg_${Date.now()}`,
      senderId: player.id,
      senderName: player.name,
      senderAvatar: player.avatarUrl,
      senderHouse: player.house,
      text: text.slice(0, 300),
      timestamp: Date.now(),
      type: 'chat',
    });

    io.to(currentRoomCode).emit('room_updated', room);
  });

  socket.on('disconnect', () => {
    if (currentRoomCode && currentPlayerId) {
      const room = rooms[currentRoomCode];
      if (room) {
        delete room.players[currentPlayerId];
        if (Object.keys(room.players).length === 0) {
          delete rooms[currentRoomCode];
        } else {
          if (room.hostId === currentPlayerId) {
            const nextHostId = Object.keys(room.players)[0];
            room.hostId = nextHostId;
            if (room.players[nextHostId]) {
              room.players[nextHostId].isHost = true;
            }
          }
          io.to(currentRoomCode).emit('room_updated', room);
        }
      }
    }
  });
});

// 3. Robust Static Middleware and Start Logic
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✨ Tomisin in Hogwarts TTRPG Server running on port ${PORT}`);
  });
}

start();