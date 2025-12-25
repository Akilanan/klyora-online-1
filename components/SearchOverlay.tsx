
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { geminiService } from '../services/geminiService';
import { BoutiqueImage } from './BoutiqueImage';

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
  catalog: Product[]; // Used for visual search
  results: Product[]; // Used for display
  currency: string;
  onVisualResults: (productIds: string[]) => void;
}

const CATEGORIES = ['Women', 'Men', 'Seasonal', 'Exclusive'];

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
  results,
  currency,
  onVisualResults
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRICE_TIERS: { label: string; range: [number, number] | null }[] = [
    { label: 'All Prices', range: null },
    { label: `Under 500 ${currency}`, range: [0, 500] },
    { label: `500 — 1000 ${currency}`, range: [500, 1000] },
    { label: `Above 1000 ${currency}`, range: [1000, 10000] },
  ];

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
    <div className="fixed inset-0 z-[600] bg-white flex flex-col animate-fade-in overflow-hidden">

      {/* Search Header (Sticky) */}
      <div className="p-8 md:px-12 md:py-8 flex justify-between items-center border-b border-black/5 bg-white z-20 shrink-0">
        <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold">Atelier Discovery</h2>
        <button
          onClick={onClose}
          className="text-[10px] uppercase font-bold tracking-widest hover:opacity-50 transition-opacity flex items-center gap-4"
        >
          Close <span className="w-8 h-[1px] bg-black"></span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Left: Filters & Input (Scrollable if needed, but fixed width) */}
        <div className="w-full md:w-[400px] shrink-0 border-r border-black/5 overflow-y-auto p-8 md:p-12 pb-32 flex flex-col gap-12 bg-zinc-50/30">

          {/* Search Input */}
          <div>
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-3xl font-serif italic bg-transparent outline-none placeholder:text-zinc-300 border-b border-black/10 pb-4 focus:border-black transition-colors"
            />
          </div>

          {/* Visual Search Button */}
          <div className="flex flex-col gap-4">
            <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400">Visual</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 border border-black/10 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                {isAnalyzing ? (
                  <div className="w-4 h-4 border border-black group-hover:border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold group-hover:underline decoration-1 underline-offset-4">Upload Image</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleVisualSearch} />
          </div>

          {/* Price Filter */}
          <div className="space-y-4">
            <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400">Price Range</h3>
            <div className="flex flex-col gap-3">
              {PRICE_TIERS.map(tier => (
                <button
                  key={tier.label}
                  onClick={() => onPriceRangeChange(tier.range)}
                  className={`text-left text-[11px] uppercase tracking-widest font-bold transition-all ${JSON.stringify(priceRange) === JSON.stringify(tier.range) ? 'text-black underline underline-offset-4' : 'text-zinc-400 hover:text-black'}`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-4">
            <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-zinc-400">Collection</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => onCategoryChange(null)}
                className={`text-left text-[11px] uppercase tracking-widest font-bold transition-all ${!activeCategory ? 'text-black underline underline-offset-4' : 'text-zinc-400 hover:text-black'}`}
              >
                All Collections
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`text-left text-[11px] uppercase tracking-widest font-bold transition-all ${activeCategory === cat ? 'text-black underline underline-offset-4' : 'text-zinc-400 hover:text-black'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
          <div className="mb-8 flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">{resultsCount} Pieces Found</span>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {results.map(product => (
                <div key={product.id} className="group cursor-pointer" onClick={onClose}>
                  <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative mb-4">
                    <BoutiqueImage
                      src={product.image}
                      alt={product.name}
                      aspectRatio="aspect-[3/4] h-full w-full"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] uppercase tracking-widest text-white border border-white/30 px-4 py-2 bg-black/30 backdrop-blur">View</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold tracking-widest truncate">{product.name}</h4>
                    <p className="text-xs font-serif italic text-zinc-500 mt-1">{currency}{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 pb-32">
              <p className="font-serif italic text-2xl mb-4">No pieces matched your curation.</p>
              <button onClick={() => { onSearchChange(''); onCategoryChange(null); onPriceRangeChange(null); }} className="text-xs uppercase tracking-widest underline underline-offset-4">Reset Filters</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
