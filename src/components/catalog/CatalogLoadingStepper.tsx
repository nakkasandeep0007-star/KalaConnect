import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Languages, Tag, FileText, Check } from 'lucide-react';

interface CatalogLoadingStepperProps {
  isGenerating: boolean;
}

const STAGES = [
  { id: 1, text: 'Creating your product catalog...', icon: Sparkles },
  { id: 2, text: 'Generating English description...', icon: FileText },
  { id: 3, text: 'Generating Hindi description...', icon: Languages },
  { id: 4, text: 'Preparing marketplace tags...', icon: Tag },
  { id: 5, text: 'Catalog ready for review.', icon: CheckCircle2 },
];

export const CatalogLoadingStepper: React.FC<CatalogLoadingStepperProps> = ({ isGenerating }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStage(0);
      return;
    }

    // Progress smoothly through the stages while generation runs
    const timer1 = setTimeout(() => setCurrentStage(1), 300);
    const timer2 = setTimeout(() => setCurrentStage(2), 1200);
    const timer3 = setTimeout(() => setCurrentStage(3), 2200);
    const timer4 = setTimeout(() => setCurrentStage(4), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-serif">
              Generating Multilingual AI Catalog
            </h3>
            <p className="text-xs text-stone-400">
              Strictly grounded in your photo and artisan notes
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          In Progress
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {STAGES.map((stage, idx) => {
          const isDone = currentStage > idx;
          const isCurrent = currentStage === idx;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                isCurrent
                  ? 'bg-slate-800 text-white font-semibold shadow-inner'
                  : isDone
                  ? 'text-emerald-400 opacity-90'
                  : 'text-stone-500 opacity-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 text-slate-900 font-bold'
                    : isCurrent
                    ? 'bg-amber-400 text-slate-900 font-bold animate-pulse'
                    : 'bg-slate-800 text-stone-500 border border-slate-700'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </div>
              <span className="text-xs">{stage.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
