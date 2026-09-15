'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Copy,
  Check,
  FileQuestion,
  Sparkles,
  Layers,
  ChevronRight,
  ListOrdered,
} from 'lucide-react';

interface RoundQuestionsSectionProps {
  interview: {
    l1Questions?: string | null;
    l2Questions?: string | null;
    l3Questions?: string | null;
    l4Questions?: string | null;
    l5Questions?: string | null;
    roundNumber?: number;
  };
  className?: string;
}

type RoundKey = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

interface RoundMeta {
  key: RoundKey;
  label: string;
  field: 'l1Questions' | 'l2Questions' | 'l3Questions' | 'l4Questions' | 'l5Questions';
}

const ROUNDS: RoundMeta[] = [
  { key: 'L1', label: 'Round L1', field: 'l1Questions' },
  { key: 'L2', label: 'Round L2', field: 'l2Questions' },
  { key: 'L3', label: 'Round L3', field: 'l3Questions' },
  { key: 'L4', label: 'Round L4', field: 'l4Questions' },
  { key: 'L5', label: 'Round L5', field: 'l5Questions' },
];

export default function RoundQuestionsSection({ interview, className = '' }: RoundQuestionsSectionProps) {
  // Determine initial active tab: default to the first round with questions, or matching roundNumber, or L1
  const initialRound = (): RoundKey => {
    if (interview.roundNumber && interview.roundNumber >= 1 && interview.roundNumber <= 5) {
      const matchKey = `L${interview.roundNumber}` as RoundKey;
      return matchKey;
    }
    for (const r of ROUNDS) {
      if (interview[r.field] && interview[r.field]?.trim()) {
        return r.key;
      }
    }
    return 'L1';
  };

  const [activeTab, setActiveTab] = useState<RoundKey>(initialRound);
  const [copied, setCopied] = useState(false);

  const currentMeta = ROUNDS.find((r) => r.key === activeTab) || ROUNDS[0];
  const currentContent = interview[currentMeta.field]?.trim() || '';

  // Calculate count of rounds that have questions
  const filledRoundsCount = ROUNDS.filter((r) => Boolean(interview[r.field]?.trim())).length;

  const handleCopy = async () => {
    if (!currentContent) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentContent);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy questions:', err);
    }
  };

  return (
    <div className={`border border-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-blue-100/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span>Interview Questions</span>
              <span className="text-slate-400 font-normal">|</span>
              <span className="text-blue-700 font-semibold">Rounds L1 – L5</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Questions curated for each round of technical and cultural evaluation.
            </p>
          </div>
        </div>

        {filledRoundsCount > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            {filledRoundsCount} of 5 Rounds Available
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            Questions pending admin entry
          </span>
        )}
      </div>

      {/* Round Tabs (L1 to L5) */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
        {ROUNDS.map((r) => {
          const hasQuestions = Boolean(interview[r.field]?.trim());
          const isActive = activeTab === r.key;

          return (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setActiveTab(r.key);
                setCopied(false);
              }}
              className={`relative flex items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-700 shadow-sm font-bold border border-blue-200/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
              title={r.label}
            >
              <div className="flex items-center gap-1.5">
                <span>{r.key}</span>
                {hasQuestions ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-blue-600' : 'bg-emerald-500'
                    }`}
                    title="Questions recorded"
                  />
                ) : (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-slate-300"
                    title="No questions recorded"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tab Questions Content Box */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        {/* Top bar of active round */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {currentMeta.label}
            </span>
          </div>

          {currentContent && (
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200'
              }`}
              title="Copy questions to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Questions</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Question Text or Empty State */}
        {currentContent ? (
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 selection:bg-blue-100">
            {currentContent}
          </div>
        ) : (
          <div className="py-6 px-4 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
            <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">
              No questions recorded for {currentMeta.label} yet
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Recruiters or interviewers can add questions for this round in the admin console.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
