import React, { useState } from 'react';
import { Sparkles, Crown, Wand2, Users, ArrowRight, Shield, Swords, MessageSquare, Send } from 'lucide-react';
import { GameRoom, Player } from '../types/game';
import { AvatarUploader } from './AvatarUploader';
import { MagicalRuneCircle } from './MagicalRuneCircle';
import { playButtonClick } from '../utils/audio';

interface LobbyViewProps {
  room: GameRoom | null;
  currentPlayer: Player | null;
  onCreateRoom: (name: string, avatar: string) => void;
  onJoinRoom: (code: string, name: string, avatar: string) => void;
  onStartSorting: () => void;
  onSendMessage: (text: string) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  currentPlayer,
  onCreateRoom,
  onJoinRoom,
  onStartSorting,
  onSendMessage,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('Tomisin');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );
  const [chatInput, setChatInput] = useState('');

  const handleCreateOrJoin = (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();
    if (mode === 'create') {
      onCreateRoom(playerName.trim() || 'Tomisin', avatarUrl);
    } else {
      onJoinRoom(roomCodeInput.trim().toUpperCase(), playerName.trim() || 'Wandering Wizard', avatarUrl);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  // If not yet in a room, render the Join / Create form
  if (!room) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 overflow-hidden" id="lobby-landing">
        {/* Magical Background Glow & Runic Circles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-950/40 via-slate-950 to-black pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <MagicalRuneCircle size={700} />
        </div>

        <div className="relative w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border-2 border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(236,72,153,0.3)] text-white">
          {/* Header Title with Birthday Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-900/70 via-rose-800/70 to-amber-900/70 border border-amber-300/40 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              Celebrating Tomisin's 27th Birthday
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-rose-300 drop-shadow-md">
              Tomisin in Hogwarts
            </h2>
            <p className="text-xs sm:text-sm text-pink-200/80 mt-1 max-w-md mx-auto">
              A magical multiplayer TTRPG adventure in pink, gold, and ancient runes. Gather up to 5 wizards to be sorted and conquer the Evil Babalawo!
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-pink-500/30 mb-6 max-w-xs mx-auto">
            <button
              type="button"
              id="tab-create-room"
              onClick={() => {
                playButtonClick();
                setMode('create');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'create'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,114,182,0.6)]'
                  : 'text-pink-300/70 hover:text-white'
              }`}
            >
              Create Gameroom
            </button>
            <button
              type="button"
              id="tab-join-room"
              onClick={() => {
                playButtonClick();
                setMode('join');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'join'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(244,114,182,0.6)]'
                  : 'text-pink-300/70 hover:text-white'
              }`}
            >
              Join Gameroom
            </button>
          </div>

          <form onSubmit={handleCreateOrJoin} className="space-y-5" id="lobby-form">
            {/* Avatar Uploader */}
            <AvatarUploader
              avatarUrl={avatarUrl}
              onAvatarChange={setAvatarUrl}
              characterName={playerName}
            />

            {/* Character Name */}
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">
                Wizard Name
              </label>
              <input
                type="text"
                id="input-player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Tomisin, Hermione, Harry..."
                maxLength={24}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-pink-500/40 text-white placeholder-pink-300/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-sm font-medium"
              />
            </div>

            {/* Room Code if Join mode */}
            {mode === 'join' && (
              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Gameroom Code (5 Letters)
                </label>
                <input
                  type="text"
                  id="input-room-code"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE"
                  maxLength={6}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-pink-500/40 text-amber-300 placeholder-pink-300/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 text-center font-mono text-lg tracking-widest font-black uppercase"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-submit-lobby"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:via-rose-400 hover:to-amber-300 text-slate-950 font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(244,114,182,0.6)] active:scale-[0.98] transition-all cursor-pointer font-serif"
            >
              <Wand2 className="w-5 h-5 text-slate-950" />
              <span>{mode === 'create' ? 'Enter Hogwarts Great Hall' : 'Join Party Gameroom'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // When inside a room lobby:
  const playersList: Player[] = Object.values(room.players) as Player[];
  const isHost = currentPlayer?.isHost;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" id="room-lobby-view">
      {/* Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-950/70 via-slate-900/90 to-pink-950/70 border-2 border-pink-500/40 p-6 sm:p-8 shadow-[0_0_30px_rgba(236,72,153,0.25)] mb-8">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-15 pointer-events-none">
          <MagicalRuneCircle size={400} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-900/60 border border-pink-400/40 text-pink-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Hogwarts Waiting Hall
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-amber-200 to-rose-200">
              Gathering Tomisin's Birthday Squad
            </h2>
            <p className="text-xs sm:text-sm text-pink-200/80 mt-1">
              Share the Room Code with up to 5 friends. Once everyone is assembled, proceed to the Sorting Hat!
            </p>
          </div>

          {/* Large Code Badge */}
          <div className="flex flex-col items-center bg-slate-950/80 border-2 border-amber-400/60 p-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <span className="text-[10px] text-pink-300 uppercase tracking-widest font-mono">
              Share Gameroom Code
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-amber-300 my-1">
              {room.code}
            </span>
            <span className="text-xs text-pink-200/70">
              {playersList.length} of {room.maxPlayers} Wizards Assembled
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-serif text-amber-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              <span>Connected Wizards ({playersList.length}/5)</span>
            </h3>
            {isHost && (
              <span className="text-xs text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">
                You are Party Leader
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="lobby-players-grid">
            {playersList.map((player) => (
              <div
                key={player.id}
                id={`lobby-player-card-${player.id}`}
                className="relative rounded-2xl bg-slate-900/80 border border-pink-500/30 p-4 flex items-center gap-4 shadow-lg hover:border-amber-400/60 transition"
              >
                <div className="relative">
                  <img
                    src={player.avatarUrl}
                    alt={player.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    referrerPolicy="no-referrer"
                  />
                  {player.isHost && (
                    <div className="absolute -top-1.5 -right-1.5 p-1 bg-amber-400 text-slate-950 rounded-full shadow-md" title="Host">
                      <Crown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white truncate">
                      {player.name}
                    </h4>
                    {player.id === currentPlayer?.id && (
                      <span className="text-[10px] bg-pink-900/80 text-pink-200 px-1.5 py-0.2 rounded border border-pink-500/40">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-pink-300/80 mt-0.5">
                    {player.house ? `Sorted: ${player.house}` : 'Awaiting Sorting Hat'}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-amber-300 font-mono">
                    <span>HP: {player.hp}</span>
                    <span>•</span>
                    <span>MP: {player.mp}</span>
                    <span>•</span>
                    <span>SP: {player.sp}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 5 - playersList.length) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="rounded-2xl border-2 border-dashed border-pink-500/20 bg-slate-950/40 p-4 flex items-center justify-center text-center gap-3 text-pink-300/40 text-xs min-h-[96px]"
              >
                <Sparkles className="w-4 h-4 opacity-40 animate-pulse" />
                <span>Empty Wizard Slot ({playersList.length + idx + 1}/5)</span>
              </div>
            ))}
          </div>

          {/* Action to Start Sorting Ceremony */}
          <div className="pt-4">
            {isHost ? (
              <button
                type="button"
                id="btn-start-sorting"
                onClick={() => {
                  playButtonClick();
                  onStartSorting();
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-slate-950 font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(244,114,182,0.6)] active:scale-[0.98] transition cursor-pointer font-serif"
              >
                <Wand2 className="w-5 h-5 text-slate-950" />
                <span>Begin Hogwarts Sorting Ceremony</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-pink-500/30 text-center text-pink-200 text-sm">
                <span className="animate-pulse">✨ Waiting for party leader ({room.players[room.hostId]?.name || 'Host'}) to begin the Sorting Ceremony...</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Party Chat (1 Col) */}
        <div className="rounded-2xl bg-slate-900/80 border border-pink-500/30 flex flex-col h-[480px] shadow-lg overflow-hidden">
          <div className="p-3.5 bg-slate-950/80 border-b border-pink-500/30 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
              Great Hall Whispers & Chat
            </h4>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {room.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-xl ${
                  msg.type === 'system'
                    ? 'bg-pink-950/50 border border-pink-500/30 text-pink-200 text-[11px] italic'
                    : msg.type === 'loot'
                    ? 'bg-amber-950/50 border border-amber-500/30 text-amber-200 text-[11px]'
                    : msg.senderId === currentPlayer?.id
                    ? 'bg-pink-600/30 border border-pink-500/40 text-white ml-4'
                    : 'bg-slate-950/60 border border-slate-700/60 text-slate-200 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-amber-300/80 font-bold mb-0.5">
                  <span>{msg.senderName}</span>
                  <span className="text-slate-400 font-normal">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="break-words">{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-2.5 bg-slate-950/90 border-t border-pink-500/30 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send a spell or greeting..."
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
    </div>
  );
};
