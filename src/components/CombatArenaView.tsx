import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Shield,
  Heart,
  Zap,
  Swords,
  Flame,
  Skull,
  Package,
  MessageSquare,
  Send,
  Dices,
  RefreshCw,
  Award,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { GameRoom, Player, CombatState, Enemy, Spell, InventoryItem } from '../types/game';
import { HOUSES } from '../data/gameData';
import {
  playButtonClick,
  playSpellCast,
  playHeal,
  playDiceRoll,
  playEnemyAttack,
  playBabalawoCast,
} from '../utils/audio';

interface CombatArenaViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onPlayerAction: (payload: {
    actionType: 'wand_attack' | 'spell' | 'ability' | 'defend' | 'use_item';
    spellId?: string;
    targetId?: string;
    itemId?: string;
  }) => void;
  onSendMessage: (text: string) => void;
  onReturnToLobby: () => void;
}

export const CombatArenaView: React.FC<CombatArenaViewProps> = ({
  room,
  currentPlayer,
  onPlayerAction,
  onSendMessage,
  onReturnToLobby,
}) => {
  const combat = room.combatState;
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>('');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [showSpellMenu, setShowSpellMenu] = useState(false);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);

  if (!combat) {
    return <div className="text-center py-20 text-pink-200">Loading Evil Forest Realm...</div>;
  }

  const isMyTurn = combat.currentActorId === currentPlayer.id;
  const aliveEnemies = combat.enemies.filter((e) => e.hp > 0);
  const currentTargetId = selectedEnemyId || (aliveEnemies[0]?.id ?? '');
  const targetEnemy = combat.enemies.find((e) => e.id === currentTargetId);
  const playersList: Player[] = Object.values(room.players) as Player[];

  const handleWandAttack = () => {
    if (!isMyTurn || !currentTargetId) return;
    playDiceRoll();
    setTimeout(() => {
      playSpellCast();
      onPlayerAction({
        actionType: 'wand_attack',
        targetId: currentTargetId,
      });
    }, 400);
  };

  const handleCastSpell = (spell: Spell) => {
    if (!isMyTurn) return;
    if (currentPlayer.mp < spell.mpCost) return;
    playDiceRoll();
    setShowSpellMenu(false);
    setTimeout(() => {
      if (spell.healing) playHeal();
      else playSpellCast();

      onPlayerAction({
        actionType: 'spell',
        spellId: spell.id,
        targetId: spell.targetType === 'single_ally' ? currentPlayer.id : currentTargetId,
      });
    }, 400);
  };

  const handleUseAbility = () => {
    if (!isMyTurn || !currentPlayer.specialAbility) return;
    if (currentPlayer.abilityCooldown > 0 || currentPlayer.mp < currentPlayer.specialAbility.mpCost) return;
    playDiceRoll();
    setTimeout(() => {
      playSpellCast();
      onPlayerAction({
        actionType: 'ability',
        targetId: currentTargetId,
      });
    }, 400);
  };

  const handleDefend = () => {
    if (!isMyTurn) return;
    playButtonClick();
    onPlayerAction({ actionType: 'defend' });
  };

  const handleUseItem = (item: InventoryItem) => {
    if (!isMyTurn) return;
    playHeal();
    setShowItemMenu(false);
    onPlayerAction({
      actionType: 'use_item',
      itemId: item.id,
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  // Defeat Screen
  if (combat.phase === 'defeat') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-white" id="combat-defeat-view">
        <div className="p-8 rounded-3xl bg-slate-950/90 border-2 border-rose-600/60 shadow-[0_0_50px_rgba(225,29,72,0.4)]">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-4xl mb-4">
            💀
          </div>
          <h2 className="text-3xl font-black font-serif text-rose-400 mb-2">
            The Party Has Fallen in the Evil Forest
          </h2>
          <p className="text-sm text-pink-200/80 mb-6">
            The Evil Babalawo's dark juju and cursed beasts overwhelmed the party. Regroup, refine your spells, and try again!
          </p>
          <button
            type="button"
            onClick={onReturnToLobby}
            className="py-3 px-8 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold tracking-wide shadow-lg transition cursor-pointer"
          >
            Return to Hogwarts Common Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4" id="combat-arena-view">
      {/* Top Combat Header & Wave Tracker */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-pink-500/40 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-pink-950/80 border border-pink-500/40 text-amber-300 text-xs font-bold font-mono">
            WAVE {combat.wave}/3
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-serif text-white flex items-center gap-2">
              <span>{combat.waveName}</span>
              {combat.wave === 3 && (
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded-full font-sans uppercase font-extrabold animate-pulse">
                  BOSS BATTLE
                </span>
              )}
            </h2>
            <p className="text-[11px] text-pink-300/70 font-mono">
              Turn #{combat.turnCount} • Turn Order Active
            </p>
          </div>
        </div>

        {/* Turn Indicator Banner */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-1.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              isMyTurn
                ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse'
                : 'bg-slate-900/90 text-pink-200 border-pink-500/30'
            }`}
          >
            <Dices className="w-4 h-4 text-amber-300" />
            <span>
              {isMyTurn
                ? '🌟 YOUR TURN! Cast or Strike!'
                : `Waiting for ${
                    room.players[combat.currentActorId]?.name ||
                    combat.enemies.find((e) => e.id === combat.currentActorId)?.name ||
                    'Combatant'
                  }...`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowChatModal(!showChatModal)}
            className="p-2 rounded-xl bg-slate-900 border border-pink-500/30 text-pink-300 hover:text-amber-300 transition"
            title="Toggle Battle Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Battlefield Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Battlefield (Enemies Top, Players Bottom) */}
        <div className="lg:col-span-8 space-y-4">
          {/* ENEMIES ROW (TOP OF BATTLEFIELD) */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950 border-2 border-purple-500/40 shadow-[0_0_35px_rgba(147,51,234,0.25)] text-white">
            <div className="flex items-center justify-between mb-3 text-xs text-pink-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-rose-400" />
                <span>Enemies in the Mist (Click to Target)</span>
              </span>
              <span className="text-[11px] text-purple-300 font-mono">
                {aliveEnemies.length} Standing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="enemies-battlefield-grid">
              {combat.enemies.map((enemy) => {
                const isSelected = currentTargetId === enemy.id;
                const isAlive = enemy.hp > 0;
                const isCurrentActor = combat.currentActorId === enemy.id;
                const hpPercent = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));

                return (
                  <button
                    key={enemy.id}
                    type="button"
                    id={`enemy-target-card-${enemy.id}`}
                    disabled={!isAlive}
                    onClick={() => {
                      if (isAlive) {
                        playButtonClick();
                        setSelectedEnemyId(enemy.id);
                      }
                    }}
                    className={`relative p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      !isAlive
                        ? 'opacity-30 bg-slate-950 border-slate-800 grayscale cursor-not-allowed'
                        : isSelected
                        ? 'border-amber-400 bg-purple-900/40 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-[1.02]'
                        : isCurrentActor
                        ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse'
                        : 'border-purple-500/30 bg-slate-900/80 hover:border-purple-400/60'
                    }`}
                  >
                    {isSelected && isAlive && (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                        Targeted
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-500/40 flex items-center justify-center text-xl shrink-0">
                          {enemy.type === 'evil_babalawo'
                            ? '🧙🏿‍♂️'
                            : enemy.type === 'wild_dog'
                            ? '🐕‍🦺'
                            : '🕷️'}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate leading-tight">
                            {enemy.name}
                          </h4>
                          <span className="text-[10px] text-pink-300/80 font-mono truncate block">
                            {enemy.title || (enemy.isBoss ? 'Boss' : 'Minion')}
                          </span>
                        </div>
                      </div>

                      {/* HP Bar */}
                      <div className="space-y-1 my-1.5">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-rose-400 font-bold">HP</span>
                          <span className="text-white">
                            {enemy.hp}/{enemy.maxHp}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-rose-500/30">
                          <div
                            className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300"
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-purple-200/80 flex items-center justify-between mt-2 pt-1 border-t border-purple-500/20">
                      <span>ATK: {enemy.attackPower}</span>
                      <span>DEF: {enemy.defense}</span>
                      <span>SPD: {enemy.speed}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PLAYERS SQUAD ROW (BOTTOM OF BATTLEFIELD) */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border-2 border-pink-500/40 shadow-[0_0_35px_rgba(236,72,153,0.2)] text-white">
            <div className="flex items-center justify-between mb-3 text-xs text-pink-200 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Hogwarts Party Vanguard ({playersList.length}/5)</span>
              </span>
              <span className="text-[11px] text-amber-300 font-mono">
                Active Initiative
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5" id="players-battlefield-grid">
              {playersList.map((p) => {
                const isActor = combat.currentActorId === p.id;
                const isMe = p.id === currentPlayer.id;
                const isAlive = p.hp > 0;
                const hpPercent = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
                const mpPercent = Math.max(0, Math.min(100, (p.mp / p.maxMp) * 100));

                return (
                  <div
                    key={p.id}
                    id={`combat-player-card-${p.id}`}
                    className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      !isAlive
                        ? 'opacity-35 bg-slate-950 border-slate-800'
                        : isActor
                        ? 'border-amber-400 bg-pink-900/40 shadow-[0_0_18px_rgba(245,158,11,0.6)] ring-2 ring-amber-400/50'
                        : isMe
                        ? 'border-pink-400/60 bg-slate-950/80'
                        : 'border-pink-500/20 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-1.5">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        {p.isDefending && (
                          <div className="absolute -top-1 -right-1 p-0.5 bg-sky-500 text-white rounded-full">
                            <Shield className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <h5 className="text-xs font-bold text-white truncate max-w-full leading-tight">
                        {p.name}
                      </h5>
                      <span className="text-[9px] text-amber-300/80 font-mono">
                        {p.house ? p.house.toUpperCase() : 'WIZARD'}
                      </span>
                    </div>

                    {/* HP & MP Micro-bars */}
                    <div className="space-y-1 mt-2">
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 transition-all duration-300"
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-sky-400 transition-all duration-300"
                          style={{ width: `${mpPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-pink-200/80 pt-0.5">
                        <span>{p.hp} HP</span>
                        <span>{p.mp} MP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION CONSOLE (BOTTOM CONTROLS) */}
          <div className="p-4 rounded-3xl bg-slate-950/90 border-2 border-pink-500/40 shadow-xl text-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold font-serif text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-pink-400" />
                <span>Action Console</span>
              </h4>
              {isMyTurn ? (
                <span className="text-[11px] text-emerald-300 font-bold animate-pulse">
                  ⚡ Choose an action for your turn
                </span>
              ) : (
                <span className="text-[11px] text-pink-300/60 font-mono">
                  Turn locked until your initiative
                </span>
              )}
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5" id="combat-actions-grid">
              {/* 1. Wand Attack */}
              <button
                type="button"
                id="btn-action-wand"
                disabled={!isMyTurn}
                onClick={handleWandAttack}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isMyTurn
                    ? 'bg-gradient-to-b from-pink-900/60 to-rose-950/80 border-pink-400 hover:border-amber-300 hover:scale-105 shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                    : 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <Wand2 className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold leading-tight">Wand Strike</span>
                <span className="text-[9px] text-pink-300/80 font-mono">0 MP • D20 Roll</span>
              </button>

              {/* 2. Spells Drawer */}
              <button
                type="button"
                id="btn-action-spells"
                disabled={!isMyTurn}
                onClick={() => {
                  playButtonClick();
                  setShowSpellMenu(!showSpellMenu);
                  setShowItemMenu(false);
                }}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isMyTurn
                    ? 'bg-gradient-to-b from-sky-900/60 to-indigo-950/80 border-sky-400 hover:border-amber-300 hover:scale-105 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <Zap className="w-5 h-5 text-sky-300" />
                <span className="text-xs font-bold leading-tight">Cast Spell</span>
                <span className="text-[9px] text-sky-200/80 font-mono">
                  {currentPlayer.spells.length} Spells
                </span>
              </button>

              {/* 3. House Special Ability */}
              <button
                type="button"
                id="btn-action-ability"
                disabled={
                  !isMyTurn ||
                  !currentPlayer.specialAbility ||
                  currentPlayer.abilityCooldown > 0 ||
                  currentPlayer.mp < (currentPlayer.specialAbility?.mpCost || 0)
                }
                onClick={handleUseAbility}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isMyTurn &&
                  currentPlayer.specialAbility &&
                  currentPlayer.abilityCooldown === 0 &&
                  currentPlayer.mp >= currentPlayer.specialAbility.mpCost
                    ? 'bg-gradient-to-b from-amber-900/60 to-yellow-950/80 border-amber-400 hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold leading-tight">House Ability</span>
                <span className="text-[9px] text-amber-200/80 font-mono">
                  {currentPlayer.abilityCooldown > 0
                    ? `${currentPlayer.abilityCooldown}T CD`
                    : `${currentPlayer.specialAbility?.mpCost || 0} MP`}
                </span>
              </button>

              {/* 4. Use Item */}
              <button
                type="button"
                id="btn-action-items"
                disabled={!isMyTurn}
                onClick={() => {
                  playButtonClick();
                  setShowItemMenu(!showItemMenu);
                  setShowSpellMenu(false);
                }}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isMyTurn
                    ? 'bg-gradient-to-b from-emerald-900/60 to-teal-950/80 border-emerald-400 hover:border-amber-300 hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <Package className="w-5 h-5 text-emerald-300" />
                <span className="text-xs font-bold leading-tight">Use Potion</span>
                <span className="text-[9px] text-emerald-200/80 font-mono">Bag Items</span>
              </button>

              {/* 5. Defend */}
              <button
                type="button"
                id="btn-action-defend"
                disabled={!isMyTurn}
                onClick={handleDefend}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isMyTurn
                    ? 'bg-gradient-to-b from-slate-800 to-slate-950 border-slate-500 hover:border-pink-300 hover:scale-105'
                    : 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <Shield className="w-5 h-5 text-slate-300" />
                <span className="text-xs font-bold leading-tight">Defend</span>
                <span className="text-[9px] text-slate-400 font-mono">-50% Dmg Taken</span>
              </button>
            </div>

            {/* SPELL SELECTION DRAWER */}
            {showSpellMenu && isMyTurn && (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 border border-sky-500/50 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                  <span>Select Spell to Cast:</span>
                  <span className="text-[10px] font-mono text-pink-300">
                    Your MP: {currentPlayer.mp}/{currentPlayer.maxMp}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="cast-spells-list">
                  {currentPlayer.spells.map((spell) => {
                    const hasMp = currentPlayer.mp >= spell.mpCost;
                    return (
                      <button
                        key={spell.id}
                        type="button"
                        id={`btn-cast-spell-${spell.id}`}
                        disabled={!hasMp}
                        onClick={() => handleCastSpell(spell)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          hasMp
                            ? 'bg-sky-950/70 border-sky-500/40 hover:border-amber-300 hover:bg-sky-900/60 cursor-pointer'
                            : 'bg-slate-950 border-slate-800 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base font-serif font-bold text-amber-300">
                            {spell.runeSymbol}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white">{spell.name}</div>
                            <div className="text-[10px] text-sky-300/80">
                              {spell.healing ? `Heals +${spell.healing}` : `${spell.damage} Dmg`} •{' '}
                              {spell.targetType.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-sky-300">
                          {spell.mpCost} MP
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ITEM SELECTION DRAWER */}
            {showItemMenu && isMyTurn && (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/50 space-y-2.5 animate-fadeIn">
                <div className="text-xs font-bold text-emerald-300">
                  Select Potion or Relic to Use:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="use-items-list">
                  {currentPlayer.inventory
                    .filter((i) => i.usableInCombat)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        id={`btn-use-item-${item.id}`}
                        onClick={() => handleUseItem(item)}
                        className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 hover:border-amber-300 hover:bg-emerald-900/60 transition text-left flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{item.name}</div>
                          <div className="text-[10px] text-emerald-300/80">
                            {item.effectDescription}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          x{item.quantity}
                        </span>
                      </button>
                    ))}
                  {currentPlayer.inventory.filter((i) => i.usableInCombat).length === 0 && (
                    <div className="text-xs text-slate-400 italic py-2">
                      No combat-usable items in inventory.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Real-time Battle Log & Chat */}
        <div className="lg:col-span-4 flex flex-col h-[640px] rounded-3xl bg-slate-900/90 border-2 border-pink-500/40 shadow-xl overflow-hidden text-white">
          <div className="p-3.5 bg-slate-950/90 border-b border-pink-500/30 flex items-center justify-between">
            <h4 className="text-xs font-bold font-serif text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-pink-400" />
              <span>Forbidden Forest Battle Log</span>
            </h4>
          </div>

          {/* Log Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs" id="combat-battle-log-stream">
            {combat.battleLog.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl border ${
                  log.actorType === 'player'
                    ? 'bg-pink-950/50 border-pink-500/40 text-pink-100'
                    : log.actorType === 'enemy'
                    ? 'bg-purple-950/60 border-purple-500/40 text-purple-100'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold mb-0.5">
                  <span>{log.actorName}</span>
                  <span className="text-slate-400 font-mono">Turn {log.turnNumber}</span>
                </div>
                <div className="text-xs leading-relaxed">{log.description}</div>
              </div>
            ))}
          </div>

          {/* Chat in Battle */}
          <form onSubmit={handleSendChat} className="p-2.5 bg-slate-950/90 border-t border-pink-500/30 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Party battle shout..."
              maxLength={150}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-pink-500/30 text-white text-xs placeholder-pink-300/40 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-2 bg-gradient-to-r from-pink-600 to-amber-500 text-white rounded-xl hover:scale-105 active:scale-95 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
