import React, { useState } from 'react';
import { Sparkles, Wand2, Shield, Heart, Zap, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SORTING_HAT_QUESTIONS, HOUSES } from '../data/gameData';
import { HouseId, Player } from '../types/game';
import { MagicalRuneCircle } from './MagicalRuneCircle';
import { playButtonClick, playSpellCast, playVictoryFanfare } from '../utils/audio';

interface SortingHatViewProps {
  player: Player;
  onSubmitSorting: (houseId: HouseId) => void;
  onEnterCommonRoom: () => void;
}

export const SortingHatView: React.FC<SortingHatViewProps> = ({
  player,
  onSubmitSorting,
  onEnterCommonRoom,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [houseScores, setHouseScores] = useState<Record<HouseId, number>>({
    gryffindor: 0,
    ravenclaw: 0,
    hufflepuff: 0,
    slytherin: 0,
  });
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [assignedHouse, setAssignedHouse] = useState<HouseId | null>(player.house);

  const question = SORTING_HAT_QUESTIONS[currentQuestionIndex];

  const handleSelectAnswer = (index: number, house: HouseId) => {
    playButtonClick();
    setSelectedAnswerIndex(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswerIndex === null) return;
    playSpellCast();

    const chosenHouse = question.answers[selectedAnswerIndex].house;
    const newScores = {
      ...houseScores,
      [chosenHouse]: houseScores[chosenHouse] + 1,
    };
    setHouseScores(newScores);
    setSelectedAnswerIndex(null);

    if (currentQuestionIndex < SORTING_HAT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Finished all questions! Deliberate & assign
      setIsDeliberating(true);
      setTimeout(() => {
        // Find house with highest score
        let bestHouse: HouseId = 'gryffindor';
        let highest = -1;
        (Object.keys(newScores) as HouseId[]).forEach((h) => {
          if (newScores[h] > highest) {
            highest = newScores[h];
            bestHouse = h;
          }
        });

        setAssignedHouse(bestHouse);
        setIsDeliberating(false);
        onSubmitSorting(bestHouse);
        playVictoryFanfare();

        // Trigger confetti for the ceremony
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F472B6', '#F59E0B', '#EC4899', '#38BDF8', '#10B981'],
        });
      }, 2500);
    }
  };

  // If already assigned or just finished:
  if (assignedHouse && !isDeliberating) {
    const houseInfo = HOUSES[assignedHouse];
    return (
      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4" id="sorting-result-view">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-950/50 via-slate-950 to-black pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 pointer-events-none">
          <MagicalRuneCircle size={600} />
        </div>

        <div className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-white text-center">
          {/* House Crest Reveal */}
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 shadow-[0_0_35px_rgba(244,114,182,0.8)] mb-4 animate-bounce">
            <span className="text-5xl">{houseInfo.crest}</span>
          </div>

          <div className="text-xs uppercase font-mono tracking-widest text-amber-300 font-bold mb-1">
            The Sorting Hat Proclaims
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-amber-100">
            {houseInfo.name.toUpperCase()}!
          </h2>
          <p className="text-sm sm:text-base text-pink-200/90 italic mt-2 max-w-lg mx-auto">
            "{houseInfo.tagline}"
          </p>

          {/* Stats Distribution Grid */}
          <div className="my-6 p-5 rounded-2xl bg-slate-950/80 border border-pink-500/30 text-left">
            <h4 className="text-xs font-bold font-serif text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>House Stats & Magical Distribution</span>
            </h4>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* HP */}
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-center">
                <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold mb-1">
                  <Heart className="w-4 h-4" /> HP
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {houseInfo.baseHp}
                </div>
                <div className="text-[10px] text-rose-300/70">Health Points</div>
              </div>

              {/* MP */}
              <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 text-center">
                <div className="flex items-center justify-center gap-1 text-sky-400 text-xs font-bold mb-1">
                  <Zap className="w-4 h-4" /> MP
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {houseInfo.baseMp}
                </div>
                <div className="text-[10px] text-sky-300/70">For Casting Spells</div>
              </div>

              {/* SP */}
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-1">
                  <Award className="w-4 h-4" /> SP
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {houseInfo.baseSp}
                </div>
                <div className="text-[10px] text-amber-300/70">For Spell Store</div>
              </div>
            </div>

            {/* Special Ability Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-950/80 to-amber-950/60 border border-amber-400/50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-bold text-amber-200">
                    Special Ability: {houseInfo.specialAbility.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-sky-300 px-2 py-0.5 rounded bg-sky-950 border border-sky-500/40">
                  {houseInfo.specialAbility.mpCost} MP • {houseInfo.specialAbility.cooldownTurns}T CD
                </span>
              </div>
              <p className="text-xs text-pink-100/90 leading-relaxed">
                {houseInfo.specialAbility.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-enter-common-room"
            onClick={() => {
              playButtonClick();
              onEnterCommonRoom();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-slate-950 font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(244,114,182,0.7)] active:scale-[0.98] transition cursor-pointer font-serif"
          >
            <Wand2 className="w-5 h-5 text-slate-950" />
            <span>Proceed to {houseInfo.name} Common Room</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      </div>
    );
  }

  // Deliberating Screen
  if (isDeliberating) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-600 to-amber-400 animate-spin blur-md opacity-75" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              🧙‍♂️
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-amber-200">
            The Sorting Hat is Deliberating...
          </h3>
          <p className="text-sm text-pink-200/80 italic">
            "Ah, yes... immense birthday sparkles, extraordinary courage, and a touch of mischief..."
          </p>
        </div>
      </div>
    );
  }

  // Questionnaire Screen
  return (
    <div className="max-w-3xl mx-auto px-4 py-8" id="sorting-questionnaire-view">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-pink-200 font-semibold mb-2">
          <span>Question {currentQuestionIndex + 1} of {SORTING_HAT_QUESTIONS.length}</span>
          <span className="text-amber-300 font-mono">
            {Math.round(((currentQuestionIndex + 1) / SORTING_HAT_QUESTIONS.length) * 100)}% Sorted
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 border border-pink-500/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / SORTING_HAT_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="relative rounded-3xl bg-slate-900/90 border-2 border-pink-500/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(236,72,153,0.25)] text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-amber-300/40 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          The Sorting Hat Speaks
        </div>

        <h3 className="text-xl sm:text-2xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-amber-200 to-rose-200 leading-snug">
          {question.question}
        </h3>
        <p className="text-xs sm:text-sm text-pink-300/80 italic mt-1.5 mb-6">
          "{question.context}"
        </p>

        {/* Answer Options */}
        <div className="space-y-3" id="sorting-answers-list">
          {question.answers.map((ans, idx) => {
            const isSelected = selectedAnswerIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                id={`sorting-answer-${idx}`}
                onClick={() => handleSelectAnswer(idx, ans.house)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-pink-900/40 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.01]'
                    : 'border-pink-500/30 bg-slate-950/60 hover:border-pink-400/60 hover:bg-pink-950/30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border mt-0.5 shrink-0 transition ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400 text-slate-950'
                      : 'border-pink-500/40 text-pink-300'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 font-bold" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {ans.text}
                  </p>
                  <p className="text-[11px] text-pink-300/70 mt-1 italic">
                    {ans.flavor}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Next / Submit Button */}
        <div className="mt-6 pt-4 border-t border-pink-500/30 flex justify-end">
          <button
            type="button"
            id="btn-next-sorting-question"
            disabled={selectedAnswerIndex === null}
            onClick={handleNextQuestion}
            className={`py-3 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 transition cursor-pointer font-serif ${
              selectedAnswerIndex !== null
                ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-slate-950 shadow-[0_0_20px_rgba(244,114,182,0.6)] hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {currentQuestionIndex < SORTING_HAT_QUESTIONS.length - 1
                ? 'Next Dilemma'
                : 'Proclaim My House'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
