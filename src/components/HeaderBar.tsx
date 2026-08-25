import React, { useState } from 'react';
import { Sparkles, Copy, Check, Users, Shield, Crown } from 'lucide-react';
import { GameRoom, Player } from '../types/game';
import { HOUSES } from '../data/gameData';
import { playButtonClick } from '../utils/audio';

interface HeaderBarProps {
  room: GameRoom | null;
  currentPlayer: Player | null;
  onLeaveRoom?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  room,
  currentPlayer,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!room) return;
    playButtonClick();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentHouse = currentPlayer?.house ? HOUSES[currentPlayer.house] : null;

  return (
    <header
      id="app-header-bar"
      className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-pink-500/30 shadow-[0_4px_25px_rgba(236,72,153,0.15)]"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Title & Birthday Theme */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 p-0.5 shadow-[0_0_15px_rgba(244,114,182,0.6)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-300">
              <Crown className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-amber-200 to-rose-300 font-serif">
                Tomisin in Hogwarts
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-900/60 text-pink-200 border border-pink-500/40">
                <Sparkles className="w-3 h-3 text-amber-300" /> 27th Birthday Quest
              </span>
            </div>
            <p className="text-[10px] text-pink-300/80 font-mono hidden sm:block">
              Magical TTRPG Multiplayer Realm
            </p>
          </div>
        </div>

        {/* Room Info & Player Status */}
        {room && (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Room Code Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/60 border border-pink-500/40 shadow-inner">
              <span className="text-[10px] font-mono text-pink-300 uppercase tracking-widest hidden xs:inline">
                ROOM:
              </span>
              <span className="text-xs sm:text-sm font-black font-mono tracking-wider text-amber-300">
                {room.code}
              </span>
              <button
                id="btn-copy-room-code"
                onClick={handleCopyCode}
                className="p-1 text-pink-300 hover:text-amber-200 transition"
                title="Copy Room Code"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Players count */}
            <div className="flex items-center gap-1 text-xs text-pink-200 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-pink-500/30">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">
                {Object.keys(room.players).length}/{room.maxPlayers}
              </span>
            </div>

            {/* Current Player Mini Crest */}
            {currentPlayer && (
              <div className="flex items-center gap-2 pl-1 border-l border-pink-500/30">
                <img
                  src={currentPlayer.avatarUrl}
                  alt={currentPlayer.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                    {currentPlayer.name}
                    {currentHouse && (
                      <span title={currentHouse.name}>{currentHouse.crest}</span>
                    )}
                  </div>
                  {currentHouse ? (
                    <div className="text-[10px] text-amber-300 font-medium leading-none">
                      {currentHouse.name}
                    </div>
                  ) : (
                    <div className="text-[10px] text-pink-300/70 font-medium leading-none">
                      Unsorted
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
