import React from 'react';
import { TranslationResult, Gloss } from '../types';
import { Play, ArrowRight, Info, Pause } from 'lucide-react';
import { clsx } from 'clsx';

interface GlossTimelineProps {
  result: TranslationResult;
  selectedGlossId: string | null;
  onSelectGloss: (gloss: Gloss) => void;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export const GlossTimeline: React.FC<GlossTimelineProps> = ({ result, selectedGlossId, onSelectGloss, onPlay, isPlaying = false }) => {
  return (
    <div className="space-y-6">
      {/* Grammar Analysis Note */}
      {result.grammarNotes && (
        <div className="bg-indigo-50 text-indigo-800 text-sm p-3 rounded-lg flex items-start gap-2">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>{result.grammarNotes}</p>
        </div>
      )}

      {/* Gloss Sentence String */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Résultat</span>
        <p className="text-lg font-mono font-medium text-slate-800">{result.translatedGlosses}</p>
      </div>

      {/* Timeline Cards */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-100 -z-10 hidden md:block" />
        
        <div className="flex flex-wrap md:flex-nowrap gap-4 overflow-x-auto pb-4 items-stretch">
          {result.glosses.map((gloss, index) => {
            const isSelected = selectedGlossId === gloss.id;
            return (
              <div key={gloss.id} className="group relative flex-shrink-0">
                <button
                  onClick={() => onSelectGloss(gloss)}
                  className={clsx(
                    "relative flex flex-col items-center min-w-[120px] p-4 rounded-xl border-2 transition-all duration-200 text-left h-full",
                    isSelected 
                      ? "border-blue-500 bg-blue-50 shadow-md scale-105 z-10" 
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                  )}
                >
                  {/* Badge Type */}
                  <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3",
                    gloss.type === 'verb' ? "bg-red-100 text-red-700" :
                    gloss.type === 'noun' ? "bg-emerald-100 text-emerald-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {gloss.type}
                  </span>

                  {/* Gloss Name */}
                  <span className="text-lg font-bold text-slate-800 mb-1">{gloss.gloss}</span>
                  
                  {/* Original Word */}
                  <span className="text-xs text-slate-400 mb-2">"{gloss.originalWord}"</span>

                  {/* Facial Expression Indicator */}
                  {gloss.facialExpression && gloss.facialExpression.toLowerCase() !== 'neutral' && (
                     <div className="mt-auto pt-2 border-t border-dashed border-slate-200 w-full text-center">
                        <span className="text-[10px] text-indigo-600 font-medium">
                          {gloss.facialExpression}
                        </span>
                     </div>
                  )}
                  
                  {/* Connector arrow for desktop */}
                  {index < result.glosses.length - 1 && (
                    <div className="hidden md:block absolute -right-[26px] top-1/2 -translate-y-1/2 text-slate-300 z-0">
                      <ArrowRight size={20} />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={onPlay}
          disabled={isPlaying}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            isPlaying 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}
        >
          {isPlaying ? <Pause size={16} className="fill-current animate-pulse" /> : <Play size={16} className="fill-current" />}
          {isPlaying ? 'Lecture en cours...' : 'Lire la séquence'}
        </button>
      </div>
    </div>
  );
};