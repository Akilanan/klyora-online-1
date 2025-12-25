
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string | null;
  onCategoryChange: (cat: string | null) => void;
  priceRange: [number, number] | null;
  onPriceRangeChange: (range: [number, number] | null) => void;
  selectedMaterial: string | null;
  onMaterialChange: (mat: string | null) => void;
  allMaterials: string[];
  resultsCount: number;
  catalog: Product[];
  onVisualResults: (productIds: string[]) => void;
}

const CATEGORIES = ['Women', 'Men', 'Seasonal', 'Exclusive'];
const PRICE_TIERS: { label: string; range: [number, number] | null }[] = [
  { label: 'All Prices', range: null },
  { label: 'Under 500 USD', range: [0, 500] },
  { label: '500 — 1000 USD', range: [500, 1000] },
  { label: 'Above 1000 USD', range: [1000, 10000] },
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedMaterial,
  onMaterialChange,
  allMaterials,
  resultsCount,
  catalog,
  onVisualResults
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVisualSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const matchedIds = await geminiService.findMatchesFromImage(base64, catalog);
        onVisualResults(matchedIds);
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-white flex flex-col animate-fade-in overflow-y-auto no-scrollbar">
      <div className="p-8 md:p-12 flex justify-between items-center border-b border-black/5 sticky top-0 bg-white z-10">
        <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold">Atelier Search & Refine</h2>
        <button 
          onClick={onClose} 
          className="text-[10px] uppercase font-bold tracking-widest hover:opacity-50 transition-opacity flex items-center gap-4"
        >
          Close <span className="w-8 h-[1px] bg-black"></span>
        </button>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-8 md:p-12 pb-32">
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="flex-1">
              <input
                autoFocus
                type="text"
                placeholder="Search our collection..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full text-5xl md:text-7xl font-serif uppercase tracking-tighter outline-none placeholder:text-zinc-100"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className="w-32 h-32 border border-black/10 rounded-full flex flex-col items-center justify-center gap-2 group hover:border-black transition-all relative overflow-hidden"
              >
                {isAnalyzing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-4 h-4 border border-black border-t-transparent animate-spin rounded-full"></div>
                    <span className="text-[7px] uppercase font-bold tracking-widest">Scanning</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-zinc-300 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-[7px] uppercase font-bold tracking-widest text-zinc-400 group-hover:text-black">Visual Sync</span>
                  </>
                )}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleVisualSearch} />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-b border-black pb-4">
             <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-400">Search by keyword or inspiration image</span>
             <span className="text-[11px] font-bold tracking-widest uppercase">{resultsCount} Pieces Found</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          <div className="space-y-8">
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold border-b border-black/5 pb-4">Categories</h3>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => onCategoryChange(null)}
                className={`text-left text-xs uppercase tracking-[0.2em] font-bold transition-all ${!activeCategory ? 'text-black' : 'text-zinc-300 hover:text-black'}`}
              >
                All Collections
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`text-left text-xs uppercase tracking-[0.2em] font-bold transition-all ${activeCategory === cat ? 'text-black' : 'text-zinc-300 hover:text-black'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold border-b border-black/5 pb-4">Price Tier</h3>
            <div className="flex flex-col gap-4">
              {PRICE_TIERS.map(tier => (
                <button 
                  key={tier.label}
                  onClick={() => onPriceRangeChange(tier.range)}
                  className={`text-left text-xs uppercase tracking-[0.2em] font-bold transition-all ${JSON.stringify(priceRange) === JSON.stringify(tier.range) ? 'text-black' : 'text-zinc-300 hover:text-black'}`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold border-b border-black/5 pb-4">Textile Origins</h3>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <button 
                onClick={() => onMaterialChange(null)}
                className={`text-left text-[10px] uppercase tracking-[0.2em] font-bold transition-all border-b pb-1 ${!selectedMaterial ? 'border-black text-black' : 'border-transparent text-zinc-300 hover:text-black'}`}
              >
                All Fibers
              </button>
              {allMaterials.map(mat => (
                <button 
                  key={mat}
                  onClick={() => onMaterialChange(mat)}
                  className={`text-left text-[10px] uppercase tracking-[0.2em] font-bold transition-all border-b pb-1 ${selectedMaterial === mat ? 'border-black text-black' : 'border-transparent text-zinc-300 hover:text-black'}`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
