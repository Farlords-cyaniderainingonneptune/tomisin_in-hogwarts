/**
 * Server-side Firestore database layer
 * Manages the requested collections:
 * - players
 * - gamerooms
 * - parties
 * - houses
 * - sorting_hat_questions
 * - sorting_hat_options
 * - user_spells_and_abilities
 * - store
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { HOUSES, SHOP_SPELLS } from '../src/data/gameData';
import { ALL_SORTING_HAT_QUESTIONS } from '../src/data/sortingHatQuestions';
import { Player, GameRoom, HouseId, Spell } from '../src/types/game';
import fs from 'fs';
import path from 'path';

let db: Firestore | null = null;

export function initDatabase(): Firestore | null {
  if (db) return db;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('⚠️ firebase-applet-config.json not found, database initialized in memory mode');
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const projectId = config.projectId;
    const firestoreDatabaseId = config.firestoreDatabaseId;

    if (!projectId) {
      console.warn('⚠️ No projectId in firebase-applet-config.json');
      return null;
    }

    if (getApps().length === 0) {
      initializeApp({
        projectId,
      });
    }

    if (firestoreDatabaseId) {
      db = getFirestore(firestoreDatabaseId);
    } else {
      db = getFirestore();
    }

    console.log(`✅ Firestore initialized for project: ${projectId} (database: ${firestoreDatabaseId || 'default'})`);
    // Seed initial collections asynchronously
    seedInitialData(db).catch((err) => console.error('Error seeding initial data:', err));

    return db;
  } catch (error) {
    console.error('Failed to initialize Firestore admin:', error);
    return null;
  }
}

/**
 * Seed Houses, Sorting Hat Questions, Options, and Store items into Firestore
 */
async function seedInitialData(firestore: Firestore) {
  try {
    // 1. Seed Houses table
    const housesRef = firestore.collection('houses');
    const existingHouses = await housesRef.limit(1).get();
    if (existingHouses.empty) {
      console.log('🌱 Seeding Hogwarts Houses table...');
      const batch = firestore.batch();
      Object.values(HOUSES).forEach((house) => {
        const docRef = housesRef.doc(house.id);
        batch.set(docRef, {
          id: house.id,
          name: house.name,
          crest: house.crest,
          tagline: house.tagline,
          baseHp: house.baseHp,
          baseMp: house.baseMp,
          baseSp: house.baseSp,
          description: house.description,
          specialAbilityName: house.specialAbility.name,
          specialAbilityDesc: house.specialAbility.description,
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
      console.log('✅ Houses seeded successfully.');
    }

    // 2. Seed Sorting Hat Questions and Options tables
    const questionsRef = firestore.collection('sorting_hat_questions');
    const existingQuestions = await questionsRef.limit(1).get();
    if (existingQuestions.empty) {
      console.log('🌱 Seeding Sorting Hat Questions and Options tables (14 questions)...');
      const qBatch = firestore.batch();
      const optionsRef = firestore.collection('sorting_hat_options');

      ALL_SORTING_HAT_QUESTIONS.forEach((q) => {
        const qDoc = questionsRef.doc(`question_${q.id}`);
        qBatch.set(qDoc, {
          questionId: q.id,
          question: q.question,
          context: q.context,
          optionsCount: q.answers.length,
          createdAt: new Date().toISOString(),
        });

        q.answers.forEach((ans, oIdx) => {
          const optDoc = optionsRef.doc(`opt_q${q.id}_${ans.house}_${oIdx}`);
          qBatch.set(optDoc, {
            id: `opt_q${q.id}_${ans.house}`,
            questionId: q.id,
            house: ans.house,
            text: ans.text,
            flavor: ans.flavor,
          });
        });
      });
      await qBatch.commit();
      console.log('✅ Sorting Hat Questions & Options seeded successfully.');
    }

    // 3. Seed Store catalog table
    const storeRef = firestore.collection('store');
    const existingStore = await storeRef.limit(1).get();
    if (existingStore.empty) {
      console.log('🌱 Seeding Magical Store catalog table...');
      const sBatch = firestore.batch();
      SHOP_SPELLS.forEach((spell) => {
        const docRef = storeRef.doc(spell.id);
        sBatch.set(docRef, {
          id: spell.id,
          name: spell.name,
          category: 'spell',
          tier: spell.tier,
          costSp: spell.costSp,
          mpCost: spell.mpCost,
          element: spell.element,
          description: spell.description,
          runeSymbol: spell.runeSymbol,
          houseAffinity: spell.houseAffinity || 'universal',
          updatedAt: new Date().toISOString(),
        });
      });
      await sBatch.commit();
      console.log('✅ Store catalog seeded successfully.');
    }
  } catch (err) {
    console.error('Seed initial data error:', err);
  }
}

/**
 * Save or update player in Firestore
 */
export async function savePlayer(player: Player, roomCode?: string, partyName?: string, partyLink?: string) {
  if (!db) return;
  try {
    await db.collection('players').doc(player.id).set(
      {
        id: player.id,
        name: player.name,
        house: player.house || 'Unsorted',
        avatarUrl: player.avatarUrl,
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp,
        sp: player.sp,
        gold: player.gold,
        stats: player.stats,
        partyName: partyName || `Party ${roomCode || ''}`,
        partyLink: partyLink || '',
        roomCode: roomCode || '',
        isHost: player.isHost,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error(`Failed to save player ${player.id} to Firestore:`, err);
  }
}

/**
 * Save or update game room in Firestore
 */
export async function saveGameRoom(room: GameRoom, partyLink: string) {
  if (!db) return;
  try {
    const playersList = Object.values(room.players);
    await db.collection('gamerooms').doc(room.code).set(
      {
        code: room.code,
        name: room.name,
        hostId: room.hostId,
        stage: room.stage,
        partyName: room.name,
        partyLink,
        playerCount: playersList.length,
        playerNames: playersList.map((p) => p.name),
        createdAt: new Date(room.createdAt).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Also sync party entry
    await db.collection('parties').doc(room.code).set(
      {
        id: room.code,
        name: room.name,
        roomCode: room.code,
        partyLink,
        hostId: room.hostId,
        hostPlayerName: room.players[room.hostId]?.name || 'Unknown',
        memberCount: playersList.length,
        members: playersList.map((p) => ({
          id: p.id,
          name: p.name,
          house: p.house,
          avatarUrl: p.avatarUrl,
        })),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error(`Failed to save gameroom/party ${room.code} to Firestore:`, err);
  }
}

/**
 * Save user spells and abilities when acquired
 */
export async function saveUserSpell(player: Player, spell: Spell) {
  if (!db) return;
  try {
    const docId = `${player.id}_${spell.id}`;
    await db.collection('user_spells_and_abilities').doc(docId).set({
      id: docId,
      playerId: player.id,
      playerName: player.name,
      spellId: spell.id,
      spellName: spell.name,
      tier: spell.tier,
      mpCost: spell.mpCost,
      element: spell.element,
      damage: spell.damage || 0,
      healing: spell.healing || 0,
      shield: spell.shield || 0,
      acquiredAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Failed to save user spell ${spell.id} for player ${player.id}:`, err);
  }
}

/**
 * Save user special ability when sorted
 */
export async function saveUserAbility(player: Player, houseId: HouseId) {
  if (!db) return;
  try {
    const house = HOUSES[houseId];
    if (!house) return;
    const ability = house.specialAbility;
    const docId = `${player.id}_${ability.id}`;
    await db.collection('user_spells_and_abilities').doc(docId).set({
      id: docId,
      playerId: player.id,
      playerName: player.name,
      spellId: ability.id,
      spellName: ability.name,
      tier: 1,
      mpCost: ability.mpCost,
      element: 'special_ability',
      description: ability.description,
      acquiredAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Failed to save ability for player ${player.id}:`, err);
  }
}

/**
 * Get all database records for the Database Inspector / Stats modal
 */
export async function getDatabaseSummary() {
  if (!db) {
    return {
      status: 'offline',
      message: 'Firestore not connected',
      tables: {},
    };
  }

  try {
    const [
      playersSnap,
      roomsSnap,
      partiesSnap,
      housesSnap,
      questionsSnap,
      optionsSnap,
      spellsSnap,
      storeSnap,
    ] = await Promise.all([
      db.collection('players').limit(20).get(),
      db.collection('gamerooms').limit(20).get(),
      db.collection('parties').limit(20).get(),
      db.collection('houses').get(),
      db.collection('sorting_hat_questions').limit(20).get(),
      db.collection('sorting_hat_options').limit(20).get(),
      db.collection('user_spells_and_abilities').limit(30).get(),
      db.collection('store').get(),
    ]);

    return {
      status: 'connected',
      tables: {
        players: playersSnap.docs.map((d) => d.data()),
        gamerooms: roomsSnap.docs.map((d) => d.data()),
        parties: partiesSnap.docs.map((d) => d.data()),
        houses: housesSnap.docs.map((d) => d.data()),
        sorting_hat_questions: questionsSnap.docs.map((d) => d.data()),
        sorting_hat_options: optionsSnap.docs.map((d) => d.data()),
        user_spells_and_abilities: spellsSnap.docs.map((d) => d.data()),
        store: storeSnap.docs.map((d) => d.data()),
      },
      counts: {
        players: playersSnap.size,
        gamerooms: roomsSnap.size,
        parties: partiesSnap.size,
        houses: housesSnap.size,
        sorting_hat_questions: questionsSnap.size,
        sorting_hat_options: optionsSnap.size,
        user_spells_and_abilities: spellsSnap.size,
        store: storeSnap.size,
      },
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: err.message,
      tables: {},
    };
  }
}
