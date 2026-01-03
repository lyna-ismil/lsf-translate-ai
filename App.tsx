import React, { useState } from 'react';
import { Layout, MessageSquare, Hand, Settings, Menu, Github } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { GlossTimeline } from './components/GlossTimeline';
import { VisualizerStage } from './components/VisualizerStage';
import { Sidebar } from './components/Sidebar';
import { Gloss, TranslationResult } from './types';
import { translateTextToGloss, generateSignImage } from './services/gemini';

const App: React.FC = () => {
  const [currentResult, setCurrentResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGloss, setSelectedGloss] = useState<Gloss | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTranslate = async (text: string) => {
    setLoading(true);
    setCurrentResult(null);
    setSelectedGloss(null);
    try {
      const result = await translateTextToGloss(text);
      setCurrentResult(result);
      if (result.glosses.length > 0) {
        setSelectedGloss(result.glosses[0]);
      }
    } catch (error) {
      console.error("Translation failed:", error);
      // In a real app, we'd show a toast here
    } finally {
      setLoading(false);
    }
  };

  const handleGlossSelect = (gloss: Gloss) => {
    if (isPlaying) return; // Prevent manual selection during playback
    setSelectedGloss(gloss);
  };

  const handlePlaySequence = async () => {
    if (!currentResult || isPlaying) return;
    
    setIsPlaying(true);
    
    // Iterate through glosses with delay
    for (const gloss of currentResult.glosses) {
      setSelectedGloss(gloss);
      // Duration from gloss or default 1.5s + small buffer
      const duration = (gloss.duration || 1.5) * 1000;
      await new Promise(resolve => setTimeout(resolve, duration));
    }
    
    setIsPlaying(false);
    // Optionally reset to first
    if (currentResult.glosses.length > 0) {
      setSelectedGloss(currentResult.glosses[0]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Hidden on mobile by default */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Hand size={18} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                LSF Translate
              </h1>
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                MVP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">
              <Github size={20} />
            </a>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* Left Column: Input & Timeline */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <InputSection onTranslate={handleTranslate} isLoading={loading} />
              
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[300px]">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-500" />
                  Séquence de Signes (Glosses)
                </h2>
                {loading ? (
                   <div className="flex flex-col items-center justify-center h-40 space-y-4">
                     <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                     <p className="text-slate-400 text-sm">Traduction et analyse grammaticale en cours...</p>
                   </div>
                ) : currentResult ? (
                  <GlossTimeline 
                    result={currentResult} 
                    selectedGlossId={selectedGloss?.id || null}
                    onSelectGloss={handleGlossSelect}
                    onPlay={handlePlaySequence}
                    isPlaying={isPlaying}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                    <Hand size={48} className="mb-4 opacity-20" />
                    <p>Entrez un texte pour générer la séquence LSF</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Visualizer */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <VisualizerStage 
                selectedGloss={selectedGloss} 
                isTranslating={loading}
              />
            </div>
          </div>
          
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;