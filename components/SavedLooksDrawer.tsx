
import React, { useState } from 'react';
import { SavedLook } from '../types';
import { geminiService } from '../services/geminiService';
import { BoutiqueImage } from './BoutiqueImage';

interface SavedLooksDrawerProps {
  looks: SavedLook[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

export const SavedLooksDrawer: React.FC<SavedLooksDrawerProps> = ({ looks, onClose, onRemove }) => {
  const [activeCaption, setActiveCaption] = useState<{id: string, text: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async (look: SavedLook) => {
    setIsGenerating(true);
    const caption = await geminiService.generateEditorialCaption(look.productName);
    setActiveCaption({ id: look.id, text: caption });
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[400] flex justify-end">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-right">
        <div className="p-8 flex items-center justify-between border-b border-black/5 bg-white">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold">Atelier Board</h2>
          <button onClick={onClose} className="text-[10px] uppercase font-bold tracking-widest hover:opacity-50">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar bg-zinc-50/20">
          {looks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-12">
              <div className="w-12 h-[1px] bg-zinc-100 mb-8"></div>
              <p className="text-[10px] uppercase tracking-[0.6em] text-zinc-300 mb-4 font-bold italic">Archive empty.</p>
              <p className="text-[8px] uppercase tracking-widest text-zinc-200 leading-relaxed">Your digital captures from the atelier fitting room will appear here for seasonal curation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {looks.map((look) => (
                <div key={look.id} className="group animate-fade-in relative">
                  <div className="mb-3 relative group">
                    <BoutiqueImage 
                      src={look.imageUrl} 
                      alt={look.productName} 
                      aspectRatio="aspect-[3/4]"
                      className="group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                       <button 
                         onClick={() => handleShare(look)}
                         className="px-4 py-2 bg-white text-black text-[8px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                       >
                         Share Look
                       </button>
                       <button 
                         onClick={() => onRemove(look.id)}
                         className="px-4 py-2 border border-white text-white text-[8px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                       >
                         Remove
                       </button>
                    </div>
                  </div>
                  <p className="text-[8px] uppercase font-bold tracking-widest truncate">{look.productName}</p>
                  <p className="text-[7px] text-zinc-400 uppercase tracking-widest mt-1">{look.date}</p>
                  
                  {activeCaption?.id === look.id && (
                    <div className="absolute inset-0 bg-black/95 text-white p-6 animate-fade-in z-20 flex flex-col justify-between">
                       <p className="text-[10px] italic leading-relaxed uppercase tracking-wide">"{activeCaption.text}"</p>
                       <button onClick={() => setActiveCaption(null)} className="text-[8px] font-bold uppercase tracking-widest self-end border-b border-white">Back</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 bg-zinc-50 border-t border-black/5">
          <p className="text-[8px] uppercase tracking-[0.3em] text-center text-zinc-400 leading-relaxed">
            Maison Klyora AI Stylist <br/>
            Your private board for editorial captures.
          </p>
        </div>
      </div>
      
      {isGenerating && (
        <div className="fixed inset-0 z-[500] bg-black/80 flex flex-col items-center justify-center text-white">
           <div className="w-10 h-10 border border-white border-t-transparent animate-spin rounded-full mb-6"></div>
           <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Generating Editorial Context...</span>
        </div>
      )}
    </div>
  );
};
