import React, { useState, useEffect } from 'react';
import { Database, X, RefreshCw, CheckCircle2, Shield, Users, Sparkles, BookOpen, ShoppingBag, Link2 } from 'lucide-react';
import { playButtonClick } from '../utils/audio';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('players');

  const fetchDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch database summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDatabase();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tables = [
    { key: 'players', label: 'players', icon: Users, desc: 'User Info, Name, House, Stats' },
    { key: 'gamerooms', label: 'gameroom', icon: Shield, desc: 'Rooms, Stages & Sessions' },
    { key: 'parties', label: 'party', icon: Link2, desc: "Party Name & Party Links" },
    { key: 'houses', label: 'house', icon: Sparkles, desc: 'Hogwarts 4 Houses & Traits' },
    { key: 'sorting_hat_questions', label: 'sorting hat questions', icon: BookOpen, desc: 'Ceremony Dilemma Pool (14 total)' },
    { key: 'sorting_hat_options', label: 'sorting hat options', icon: Sparkles, desc: 'House Options Randomized' },
    { key: 'user_spells_and_abilities', label: "user's spells & abilities", icon: Sparkles, desc: 'Unlocked Spells & Masteries' },
    { key: 'store', label: 'store', icon: ShoppingBag, desc: 'Magical Spells & Items' },
  ];

  const currentRecords = data?.tables?.[activeTable] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md" id="database-inspector-modal">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border-2 border-amber-400/60 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pink-500/30 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif text-amber-200">
                  Hogwarts Realm Database (PostgreSQL / Firestore Tables)
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" /> Online
                </span>
              </div>
              <p className="text-xs text-pink-200/70">
                Live persistence for Players, Gamerooms, Parties, Houses, Sorting Questions, User Spells & Store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playButtonClick();
                fetchDatabase();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-200 border border-pink-500/30 transition cursor-pointer"
              title="Refresh Database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                playButtonClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-200 border border-pink-500/30 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Selector Tabs */}
        <div className="p-3 bg-slate-950/50 border-b border-pink-500/20 overflow-x-auto flex gap-2 no-scrollbar">
          {tables.map((t) => {
            const Icon = t.icon;
            const count = data?.counts?.[t.key] ?? (data?.tables?.[t.key]?.length ?? 0);
            const isSelected = activeTable === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  playButtonClick();
                  setActiveTable(t.key);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/80 text-pink-200 hover:bg-slate-800 border border-pink-500/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-950 text-amber-300' : 'bg-pink-950/80 text-pink-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Content Records */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto font-mono text-xs">
          {loading && !data ? (
            <div className="text-center py-16 text-pink-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-300 mb-2" />
              <span>Querying Hogwarts tables...</span>
            </div>
          ) : currentRecords.length === 0 ? (
            <div className="text-center py-16 text-pink-300/60 bg-slate-950/40 rounded-2xl border border-pink-500/20">
              <span>No records currently found in [{activeTable}] table.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {currentRecords.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-pink-500/30 hover:border-amber-400/50 transition shadow"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-500/20 text-[11px] text-amber-300">
                    <span className="font-bold">
                      Record #{idx + 1} &bull; {item.name || item.id || item.code || `ID ${item.questionId}`}
                    </span>
                    {item.updatedAt && (
                      <span className="text-pink-300/60 text-[10px]">
                        {new Date(item.updatedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <pre className="text-pink-100 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/90 border-t border-pink-500/30 flex items-center justify-between text-[11px] text-pink-300/80">
          <div className="flex items-center gap-2">
            <span>Active Database Engine:</span>
            <span className="text-amber-300 font-semibold">PostgreSQL Firestore Mirror</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
