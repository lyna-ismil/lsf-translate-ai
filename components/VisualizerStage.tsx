import React, { useState, useEffect, useRef } from 'react';
import { Gloss } from '../types';
import { Video, Image as ImageIcon, Loader2, Sparkles, AlertCircle, Database, Film, Users } from 'lucide-react';
import { generateSignImage } from '../services/gemini';
import { getDatasetStats } from '../services/dictionary';

interface VisualizerStageProps {
  selectedGloss: Gloss | null;
  isTranslating: boolean;
}

export const VisualizerStage: React.FC<VisualizerStageProps> = ({ selectedGloss, isTranslating }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const datasetStats = getDatasetStats();

  // Switch to video tab by default when gloss changes
  useEffect(() => {
    setActiveTab('video');
    setGeneratedImage(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedGloss]);

  const handleGenerateImage = async () => {
    if (!selectedGloss) return;
    setIsGenerating(true);
    const img = await generateSignImage(selectedGloss);
    setGeneratedImage(img);
    setIsGenerating(false);
  };

  if (isTranslating) {
    return (
      <div className="bg-white h-full rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Analyse linguistique et recherche vidéo...</p>
      </div>
    );
  }

  if (!selectedGloss) {
    return (
      <div className="bg-white h-full rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Film className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Visualiseur LSF</h3>
        <p className="text-slate-400 max-w-xs mb-6">Sélectionnez un gloss dans la séquence pour voir sa vidéo ou générer une illustration.</p>
        
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Database size={12} />
            <span>Dataset: {datasetStats.source}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
             <Users size={12} />
             <span>{datasetStats.interpreters} Interprètes Professionnels</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'video' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Video size={16} />
          Vidéo (Matignon-LSF)
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'image' 
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ImageIcon size={16} />
          IA Générative (Backup)
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
        
        {/* Video View */}
        {activeTab === 'video' && (
          <div className="w-full h-full flex flex-col relative">
            {selectedGloss.videoUrl ? (
              <div className="relative w-full h-full flex flex-col">
                <video 
                  ref={videoRef}
                  key={selectedGloss.videoUrl} // Force re-render on url change
                  src={selectedGloss.videoUrl} 
                  controls 
                  autoPlay
                  loop
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full">
                    <Database size={12} className="text-green-400" />
                    <span>Source: {datasetStats.source}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
                <div className="absolute inset-0 opacity-10" 
                     style={{backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
                </div>
                
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700">
                   <Video className="text-slate-500 w-8 h-8" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2">Vidéo non trouvée</h3>
                <p className="text-slate-400 text-sm max-w-xs mb-8">
                  Le signe "{selectedGloss.gloss}" n'est pas encore indexé dans le corpus Matignon-LSF (39h).
                </p>
                <button
                  onClick={() => setActiveTab('image')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  Générer avec l'IA
                </button>
              </div>
            )}
            
            {/* Description Overlay (Always visible in video tab) */}
            <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none">
               <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-sm">
                <h4 className="text-white font-bold text-xl mb-1">{selectedGloss.gloss}</h4>
                <p className="text-slate-300 text-xs">{selectedGloss.description}</p>
                {selectedGloss.facialExpression && (
                  <p className="text-indigo-300 text-xs mt-1 font-medium italic">Expression: {selectedGloss.facialExpression}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generative Image View */}
        {activeTab === 'image' && (
          <div className="w-full h-full flex flex-col relative">
            {generatedImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={generatedImage} 
                  alt={`Signe pour ${selectedGloss.gloss}`} 
                  className="w-full h-full object-contain bg-slate-800"
                />
                <button 
                  onClick={() => setGeneratedImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
                >
                  <Loader2 size={16} />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                   <Sparkles className="text-white w-8 h-8" />
                </div>
                <h3 className="text-white text-lg font-medium mb-2">Générer une référence visuelle</h3>
                <p className="text-slate-400 text-sm max-w-xs mb-8">
                  Utilisez l'IA Gemini pour créer une image photoréaliste illustrant comment signer "{selectedGloss.gloss}".
                </p>
                <button
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} className="text-purple-600" />
                      Générer l'image
                    </>
                  )}
                </button>
                <p className="mt-4 text-xs text-slate-500">
                  Powered by Gemini 3 Image Preview
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="bg-slate-50 p-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>Durée est.: {selectedGloss.duration}s</span>
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${activeTab === 'video' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
          {activeTab === 'video' ? 'Vidéo pré-enregistrée' : 'Gemini Image Gen'}
        </span>
      </div>
    </div>
  );
};