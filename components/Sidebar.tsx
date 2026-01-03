import React from 'react';
import { Home, History, BookOpen, HelpCircle, X, ExternalLink } from 'lucide-react';

interface SidebarProps {
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
        <span className="font-semibold text-slate-800">Menu</span>
        <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto">
        
        {/* Navigation */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
            <Home size={18} />
            Traducteur
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <BookOpen size={18} />
            Dictionnaire LSF
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <History size={18} />
            Historique
          </button>
        </div>

        {/* History Preview */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Récent
          </h3>
          <div className="space-y-2">
            <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors">
              <p className="text-xs text-slate-500 mb-1">Aujourd'hui, 10:23</p>
              <p className="text-sm font-medium text-slate-800 truncate">Bonjour, je m'appelle...</p>
            </div>
            <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors">
              <p className="text-xs text-slate-500 mb-1">Hier, 15:45</p>
              <p className="text-sm font-medium text-slate-800 truncate">Où est la gare ?</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-start gap-3">
            <HelpCircle size={20} className="shrink-0 mt-0.5 opacity-80" />
            <div>
              <h4 className="font-semibold text-sm mb-1">Comment ça marche ?</h4>
              <p className="text-xs opacity-90 leading-relaxed">
                Ce prototype utilise Gemini pour convertir le texte en "Glosses" LSF, respectant la grammaire spatiale.
              </p>
              <a href="#" className="inline-flex items-center gap-1 mt-3 text-xs font-medium hover:underline opacity-100">
                Documentation <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">John Doe</p>
            <p className="text-xs text-slate-500 truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};