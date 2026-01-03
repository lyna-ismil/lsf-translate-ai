import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

interface InputSectionProps {
  onTranslate: (text: string) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onTranslate, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTranslate(text);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="input-text" className="block text-sm font-medium text-slate-700 mb-2">
          Texte Français
        </label>
        <div className="relative">
          <textarea
            id="input-text"
            className="w-full min-h-[120px] p-4 pr-12 text-lg text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-400"
            placeholder="Écrivez votre phrase ici... (ex: Bonjour, je m'appelle Thomas)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          {text && (
            <button
              type="button"
              onClick={() => setText('')}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-slate-500 flex gap-2">
            <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">Français → LSF</span>
          </div>
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all transform active:scale-95
              ${!text.trim() || isLoading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25'}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Traduction...</span>
              </>
            ) : (
              <>
                <span>Traduire</span>
                <Send size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};