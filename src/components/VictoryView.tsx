import React, { useEffect } from 'react';
import { Crown, Sparkles, Trophy, Award, Coins, HeartHandshake, ArrowRight, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameRoom, Player } from '../types/game';
import { HOUSES } from '../data/gameData';
import { MagicalRuneCircle } from './MagicalRuneCircle';
import { playVictoryFanfare, playButtonClick } from '../utils/audio';

interface VictoryViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onReturnToCommonRoom: () => void;
}

export const VictoryView: React.FC<VictoryViewProps> = ({
  room,
  currentPlayer,
  onReturnToCommonRoom,
}) => {
  useEffect(() => {
    playVictoryFanfare();
    
    // Multi-burst birthday celebration confetti
    const end = Date.now() + 4 * 1000;
    const interval: NodeJS.Timeout = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#F472B6', '#F59E0B', '#EC4899', '#38BDF8', '#10B981'],
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const playersList: Player[] = Object.values(room.players) as Player[];

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 overflow-hidden" id="victory-celebration-view">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-950/60 via-slate-950 to-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
        <MagicalRuneCircle size={750} />
      </div>

      <div className="relative w-full max-w-3xl bg-slate-900/90 backdrop-blur-xl border-2 border-amber-400/80 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(245,158,11,0.4)] text-white text-center">
        {/* Crown & Birthday Emblem */}
        <div className="inline-flex p-5 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 shadow-[0_0_40px_rgba(244,114,182,0.9)] mb-4 animate-bounce">
          <Crown className="w-12 h-12 text-slate-950" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-pink-950/80 border border-amber-300/50 text-amber-200 text-xs font-black uppercase tracking-widest mb-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300" />
          Happy 27th Birthday Tomisin!
        </div>

        <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-rose-100">
          The Evil Babalawo is Banished!
        </h2>
        <p className="text-sm sm:text-base text-pink-200/90 italic mt-2 max-w-xl mx-auto">
          The Forbidden Forest has been purified by the brave magic of Hogwarts! Tomisin and her wizard companions saved the realm in legendary fashion.
        </p>

        {/* Victory Rewards Card */}
        <div className="my-6 p-5 rounded-2xl bg-slate-950/80 border border-pink-500/40 text-left">
          <h4 className="text-xs font-bold font-serif text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-pink-400" />
            <span>Quest Rewards & Birthday Honors Distributed</span>
          </h4>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-center">
              <div className="text-amber-400 text-xs font-bold flex items-center justify-center gap-1">
                <Coins className="w-4 h-4" /> Galleons
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                +250
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 text-center">
              <div className="text-sky-400 text-xs font-bold flex items-center justify-center gap-1">
                <Award className="w-4 h-4" /> Spell Points
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-sky-300">
                +100 SP
              </div>
            </div>

            <div className="p-3 rounded-xl bg-pink-950/60 border border-pink-500/40 text-center">
              <div className="text-pink-400 text-xs font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4" /> Birthday Relic
              </div>
              <div className="text-xs font-black font-serif text-pink-200 mt-1">
                Crown of Starlight
              </div>
            </div>
          </div>

          {/* Party Hero Spotlight */}
          <div className="border-t border-pink-500/30 pt-3">
            <div className="text-xs font-bold text-amber-200 mb-2">
              Honored Hogwarts Squad:
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {playersList.map((p) => {
                const pHouse = p.house ? HOUSES[p.house] : null;
                return (
                  <div key={p.id} className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-pink-500/30">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left text-xs font-bold text-white">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-amber-300">{pHouse?.name || 'Wizard'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          id="btn-return-common-room-victory"
          onClick={() => {
            playButtonClick();
            onReturnToCommonRoom();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-slate-950 font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(244,114,182,0.8)] active:scale-[0.98] transition cursor-pointer font-serif"
        >
          <Wand2 className="w-5 h-5 text-slate-950" />
          <span>Return to Hogwarts Common Room & Spell Store</span>
          <ArrowRight className="w-5 h-5 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
