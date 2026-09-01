import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Shield,
  Heart,
  Zap,
  Award,
  Swords,
  ShoppingBag,
  Package,
  MessageSquare,
  Send,
  Flame,
  Snowflake,
  Sun,
  PartyPopper,
  CheckCircle2,
  Clock,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { GameRoom, Player, Spell, InventoryItem, HouseId } from '../types/game';
import { HOUSES, SHOP_SPELLS } from '../data/gameData';
import { MagicalRuneCircle } from './MagicalRuneCircle';
import { playButtonClick, playSpellCast } from '../utils/audio';

interface CommonRoomViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onBuySpell: (spellId: string) => void;
  onToggleReady: () => void;
  onStartQuest: () => void;
  onSendMessage: (text: string) => void;
}

export const CommonRoomView: React.FC<CommonRoomViewProps> = ({
  room,
  currentPlayer,
  onBuySpell,
  onToggleReady,
  onStartQuest,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'lounge' | 'shop' | 'inventory'>('lounge');
  const [chatInput, setChatInput] = useState('');
  const [selectedShopSpell, setSelectedShopSpell] = useState<Spell | null>(SHOP_SPELLS[0]);

  const house = currentPlayer.house ? HOUSES[currentPlayer.house] : HOUSES['gryffindor'];
  const playersList: Player[] = Object.values(room.players) as Player[];
  const isHost = currentPlayer.isHost;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  const handleBuySpell = (spell: Spell) => {
    if (currentPlayer.sp < spell.costSp) return;
    playSpellCast();
    onBuySpell(spell.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6" id="common-room-container">
      {/* Top Welcome Banner with House Colors & Birthday Glow */}
      <div
        className={`relative rounded-3xl overflow-hidden border-2 ${house.borderColor} bg-gradient-to-r ${house.bgGradient} p-5 sm:p-7 shadow-[0_0_40px_rgba(236,72,153,0.3)] mb-6 text-white`}
      >
        <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 opacity-15 pointer-events-none">
          <MagicalRuneCircle size={450} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border-2 border-amber-300/60 p-1 flex items-center justify-center text-4xl sm:text-5xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              {house.crest}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-black/50 text-amber-300 border border-amber-400/40 mb-1">
                <Sparkles className="w-3 h-3 text-pink-400" />
                {house.name} Common Room Lounge
              </div>
              <h2 className="text-xl sm:text-3xl font-black font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-amber-200 to-rose-100">
                Welcome, {currentPlayer.name}
              </h2>
              <p className="text-xs sm:text-sm text-pink-200/80 italic mt-0.5">
                "{house.tagline}"
              </p>
            </div>
          </div>

          {/* Quick Player Stat Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* HP */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-rose-500/40">
              <Heart className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-[10px] text-rose-300/70 leading-none">HP</div>
                <div className="text-sm font-black font-mono text-white">
                  {currentPlayer.hp}/{currentPlayer.maxHp}
                </div>
              </div>
            </div>

            {/* MP */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-sky-500/40">
              <Zap className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-sky-300/70 leading-none">MP (Magic)</div>
                <div className="text-sm font-black font-mono text-sky-200">
                  {currentPlayer.mp}/{currentPlayer.maxMp}
                </div>
              </div>
            </div>

            {/* SP */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-amber-500/40">
              <Award className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-amber-300/70 leading-none">SP (Spell Points)</div>
                <div className="text-sm font-black font-mono text-amber-300">
                  {currentPlayer.sp}
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/70 border border-yellow-500/40">
              <Coins className="w-4 h-4 text-yellow-400" />
              <div>
                <div className="text-[10px] text-yellow-300/70 leading-none">Galleons</div>
                <div className="text-sm font-black font-mono text-yellow-300">
                  {currentPlayer.gold}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-pink-500/30 pb-3 mb-6 overflow-x-auto">
        <button
          type="button"
          id="tab-common-room-lounge"
          onClick={() => {
            playButtonClick();
            setActiveTab('lounge');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'lounge'
              ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,114,182,0.5)]'
              : 'text-pink-300/70 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Hearth & Party Status</span>
        </button>

        <button
          type="button"
          id="tab-spell-store"
          onClick={() => {
            playButtonClick();
            setActiveTab('shop');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap relative ${
            activeTab === 'shop'
              ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,114,182,0.5)]'
              : 'text-pink-300/70 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-amber-300" />
          <span>Diagon Spell Store</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
            {currentPlayer.sp} SP
          </span>
        </button>

        <button
          type="button"
          id="tab-inventory"
          onClick={() => {
            playButtonClick();
            setActiveTab('inventory');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,114,182,0.5)]'
              : 'text-pink-300/70 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-amber-300" />
          <span>Dynamic Inventory ({currentPlayer.inventory.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: LOUNGE & QUEST DISPATCH */}
      {activeTab === 'lounge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="common-room-lounge-tab">
          {/* Left 2 Cols: Quest Mission Card + Party Members */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quest 1 Briefing Card */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/60 bg-gradient-to-br from-slate-950 via-pink-950/40 to-slate-950 p-6 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-wider">
                  <Swords className="w-3.5 h-3.5 text-rose-400" /> Quest 1: The Forbidden Woods
                </div>
                <span className="text-xs text-amber-300 font-mono">
                  3 Waves of Turn-Based Combat
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-rose-200">
                Defeat The Evil Babalawo & His Dark Beasts
              </h3>
              <p className="text-xs sm:text-sm text-pink-200/80 mt-2 leading-relaxed">
                A dark omen threatens Tomisin's 27th birthday! The infamous <strong>Evil Babalawo</strong> has awakened deep within the cursed forest, commanding ferocious wild shadow hounds and venomous giant spiders. Form your party, equip your spells, and cleanse the woods!
              </p>

              {/* Monster Preview Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-pink-500/30 text-center">
                  <div className="text-sm">🐕‍🦺</div>
                  <div className="text-xs font-bold text-amber-200 mt-1">Wave 1: Wild Dogs</div>
                  <div className="text-[10px] text-pink-300/70">Rabid Forest Pack</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-pink-500/30 text-center">
                  <div className="text-sm">🕷️</div>
                  <div className="text-xs font-bold text-amber-200 mt-1">Wave 2: Giant Spiders</div>
                  <div className="text-[10px] text-pink-300/70">Venom Acid Weavers</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/40 text-center">
                  <div className="text-sm">🧙🏿‍♂️</div>
                  <div className="text-xs font-bold text-rose-300 mt-1">Wave 3: Evil Babalawo</div>
                  <div className="text-[10px] text-rose-300/70">Dark Juju Sorcerer Boss</div>
                </div>
              </div>

              {/* Ready / Start Quest Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  id="btn-toggle-ready"
                  onClick={() => {
                    playButtonClick();
                    onToggleReady();
                  }}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer ${
                    currentPlayer.isReady
                      ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-pink-500/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentPlayer.isReady ? 'Wand Ready!' : 'Mark Ready'}</span>
                </button>

                {isHost ? (
                  <button
                    type="button"
                    id="btn-start-quest"
                    onClick={() => {
                      playSpellCast();
                      onStartQuest();
                    }}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(244,114,182,0.7)] active:scale-[0.98] transition cursor-pointer font-serif"
                  >
                    <Swords className="w-5 h-5 text-slate-950" />
                    <span>Embark on Quest (Forest Combat)</span>
                    <ChevronRight className="w-4 h-4 text-slate-950" />
                  </button>
                ) : (
                  <div className="text-xs text-pink-200/80 italic text-center sm:text-left py-2">
                    Waiting for Party Leader to launch the Quest into the Evil Forest...
                  </div>
                )}
              </div>
            </div>

            {/* Party Members Roster */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>{room.partyName || "Tomisin's Birthday Squad"} ({playersList.length}/5)</span>
                </h3>
                {room.partyLink && (
                  <span className="text-[11px] font-mono text-pink-300 bg-pink-950/60 px-2.5 py-0.5 rounded-full border border-pink-500/30">
                    Party Link: <strong className="text-amber-300">{room.partyLink}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="common-room-party-grid">
                {playersList.map((p) => {
                  const pHouse = p.house ? HOUSES[p.house] : null;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-pink-500/30 flex items-center gap-3 shadow-md"
                    >
                      <div className="relative">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                          referrerPolicy="no-referrer"
                        />
                        {p.isReady && (
                          <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-1">
                            {p.name}
                            {pHouse && <span title={pHouse.name}>{pHouse.crest}</span>}
                          </h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              p.isReady
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-950 text-slate-400'
                            }`}
                          >
                            {p.isReady ? 'READY' : 'PREPARING'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-pink-300/80 font-mono mt-1">
                          <span className="text-rose-300 font-bold">HP: {p.hp}/{p.maxHp}</span>
                          <span>•</span>
                          <span className="text-sky-300 font-bold">MP: {p.mp}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-bold">SP: {p.sp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Ability Summary Card */}
            {currentPlayer.specialAbility && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/60 to-amber-950/40 border border-pink-500/40 text-white">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <h4 className="text-sm font-bold text-amber-200">
                      Your House Ability: {currentPlayer.specialAbility.name}
                    </h4>
                  </div>
                  <span className="text-xs text-sky-300 font-mono">
                    {currentPlayer.specialAbility.mpCost} MP • {currentPlayer.specialAbility.cooldownTurns} Turn CD
                  </span>
                </div>
                <p className="text-xs text-pink-200/90 leading-relaxed">
                  {currentPlayer.specialAbility.description}
                </p>
              </div>
            )}
          </div>

          {/* Right 1 Col: Real-time Great Hall Chat */}
          <div className="rounded-3xl bg-slate-900/80 border border-pink-500/30 flex flex-col h-[520px] shadow-lg overflow-hidden">
            <div className="p-3.5 bg-slate-950/90 border-b border-pink-500/30 flex items-center gap-2 text-white">
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-serif">
                Common Room Enchanted Chat
              </h4>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {room.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl ${
                    msg.type === 'system'
                      ? 'bg-pink-950/60 border border-pink-500/30 text-pink-200 text-[11px] italic'
                      : msg.type === 'loot'
                      ? 'bg-amber-950/60 border border-amber-500/30 text-amber-200 text-[11px]'
                      : msg.senderId === currentPlayer.id
                      ? 'bg-pink-600/30 border border-pink-500/40 text-white ml-3'
                      : 'bg-slate-950/70 border border-slate-700/60 text-slate-200 mr-3'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold mb-0.5">
                    <span>{msg.senderName}</span>
                    <span className="text-slate-400 font-normal">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="break-words">{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-2.5 bg-slate-950/90 border-t border-pink-500/30 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Cast a message to the room..."
                maxLength={200}
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
      )}

      {/* TAB CONTENT: SPELL STORE (DIAGON ALLEY) */}
      {activeTab === 'shop' && (
        <div className="space-y-6" id="diagon-spell-store-tab">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-pink-500/30">
            <div>
              <h3 className="text-lg font-bold font-serif text-amber-200 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-400" />
                <span>Diagon Alley Spell Emporium</span>
              </h3>
              <p className="text-xs text-pink-200/80">
                Unlock ancient enchantments and birthday incantations using your Spell Points (SP).
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-950/70 border border-amber-500/50 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-amber-300/70 leading-none">Your Available SP</div>
                <div className="text-lg font-black font-mono text-amber-300">
                  {currentPlayer.sp} SP
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="shop-spells-grid">
            {SHOP_SPELLS.map((spell) => {
              const alreadyLearned = currentPlayer.spells.some((s) => s.id === spell.id);
              const canAfford = currentPlayer.sp >= spell.costSp;

              return (
                <div
                  key={spell.id}
                  id={`shop-spell-card-${spell.id}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    alreadyLearned
                      ? 'bg-slate-950/60 border-emerald-500/40 opacity-90'
                      : 'bg-slate-900/90 border-pink-500/40 hover:border-amber-400/80 shadow-md'
                  }`}
                >
                  <div>
                    {/* Header with Rune Symbol & Element */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-pink-950/80 border border-pink-500/40 flex items-center justify-center text-amber-300 font-serif font-black text-base shadow-sm">
                          {spell.runeSymbol}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {spell.name}
                          </h4>
                          <span className="text-[10px] text-pink-300/80 uppercase font-mono">
                            Tier {spell.tier} • {spell.element}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">
                        {spell.costSp} SP
                      </span>
                    </div>

                    <p className="text-xs text-pink-100/80 leading-relaxed mb-3">
                      {spell.description}
                    </p>

                    {/* Spell Stats */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/80 p-2 rounded-xl border border-pink-500/20 mb-3">
                      <div>
                        <span className="text-sky-400 font-bold">MP Cost:</span> {spell.mpCost} MP
                      </div>
                      <div>
                        <span className="text-rose-400 font-bold">
                          {spell.healing ? 'Healing:' : 'Damage:'}
                        </span>{' '}
                        {spell.healing ? `+${spell.healing} HP` : `${spell.damage || 0} Dmg`}
                      </div>
                      <div className="col-span-2 text-[10px] text-pink-300/70">
                        Target: {spell.targetType.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <div>
                    {alreadyLearned ? (
                      <div className="w-full py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Learned & Ready
                      </div>
                    ) : (
                      <button
                        type="button"
                        id={`btn-buy-spell-${spell.id}`}
                        disabled={!canAfford}
                        onClick={() => handleBuySpell(spell)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition cursor-pointer font-serif ${
                          canAfford
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-slate-950 hover:scale-[1.02] shadow-[0_0_15px_rgba(244,114,182,0.5)]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{canAfford ? `Learn for ${spell.costSp} SP` : 'Insufficient SP'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DYNAMIC INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-6" id="dynamic-inventory-tab">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-pink-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-amber-200 flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-400" />
                <span>Wizard Satchel & Equipment</span>
              </h3>
              <p className="text-xs text-pink-200/80">
                Manage your potions, relics, wands and birthday celebration gifts for battle.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="inventory-items-grid">
            {currentPlayer.inventory.map((item) => (
              <div
                key={item.id}
                id={`inventory-item-${item.id}`}
                className="p-4 rounded-2xl bg-slate-900/90 border border-pink-500/40 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-pink-950 border border-pink-500/40 flex items-center justify-center text-lg">
                        {item.type === 'birthday_gift'
                          ? '🎂'
                          : item.type === 'potion'
                          ? '🧪'
                          : item.type === 'wand'
                          ? '🪄'
                          : '✨'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-amber-300 uppercase font-mono">
                          {item.rarity} • {item.type}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold font-mono text-pink-200 bg-pink-950 px-2 py-0.5 rounded border border-pink-500/40">
                      x{item.quantity}
                    </span>
                  </div>

                  <p className="text-xs text-pink-100/80 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-amber-300 font-medium">
                    ⚡ {item.effectDescription}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-pink-500/20 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{item.usableInCombat ? '⚔️ Usable in Combat' : '🛡️ Passive Equipment'}</span>
                  <span>Value: {item.value} Galleons</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
