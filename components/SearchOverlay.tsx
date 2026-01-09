import React, { useRef, useState } from 'react';
import { Product } from '../types';
import { BoutiqueImage } from './BoutiqueImage';
import { geminiService } from '../services/geminiService';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch?: (query: string) => void; // New prop for "Enter" action
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
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
  allColors: string[];
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  isAiAnalyzing?: boolean;
}

const CATEGORIES = ['Women', 'Men', 'Seasonal', 'Exclusive'];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSearch,
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
  onVisualResults,
  selectedColor,
  onColorChange,
  allColors,
  inStockOnly,
  onInStockChange,
  sortBy,
  onSortChange,
  isAiAnalyzing
}) => {
  const [isVisualAnalyzing, setIsVisualAnalyzing] = useState(false);
  const isAnalyzing = isVisualAnalyzing || isAiAnalyzing;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRICE_TIERS: { label: string; range: [number, number] | null }[] = [
    { label: 'All Prices', range: null },
    { label: `Under 500 ${currency}`, range: [0, 500] },
    { label: `500 — 1000 ${currency}`, range: [500, 1000] },
    { label: `Above 1000 ${currency}`, range: [1000, 10000] },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-white flex flex-col animate-fade-in overflow-hidden">

      {/* Header */}
      <div className="px-8 py-6 md:px-12 md:py-8 flex justify-between items-center border-b border-black/5 bg-white z-20 shrink-0">
        <h2 className="text-xs uppercase tracking-[0.4em] font-bold text-zinc-900">Atelier Discovery</h2>
        <button
          onClick={onClose}
          className="text-[10px] uppercase font-bold tracking-widest hover:opacity-50 transition-opacity flex items-center gap-4 group"
        >
          Close <span className="w-12 h-[1px] bg-black group-hover:w-0 transition-all duration-500"></span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Sidebar: Filters & Controls */}
        <div className="w-full md:w-[420px] shrink-0 border-r border-black/5 overflow-y-auto bg-zinc-50/50 backdrop-blur-sm">
          <div className="p-8 md:p-12 flex flex-col gap-12 min-h-full">

            {/* Search Input */}
            <div className="relative group">
              <input
                autoFocus
                type="text"
                placeholder={isAnalyzing ? "Analyzing visual patterns..." : "Find anything..."}
                disabled={isAnalyzing}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    const history = JSON.parse(localStorage.getItem('klyora_search_history') || '[]');
                    if (!history.includes(searchQuery)) {
                      localStorage.setItem('klyora_search_history', JSON.stringify([searchQuery, ...history].slice(0, 5)));
                    }
                    if (onSearch) {
                      onSearch(searchQuery);
                    }
                  }
                }}
                className={`w-full text-2xl md:text-3xl font-serif italic bg-transparent outline-none placeholder:text-zinc-300 border-b pb-4 transition-all ${isAnalyzing ? 'border-black/50 opacity-50' : 'border-black/10 focus:border-black group-hover:border-black/30'}`}
              />

              <div className="absolute right-0 bottom-4 flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setIsVisualAnalyzing(true);
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const base64 = (reader.result as string).split(',')[1];
                      const matchedIds = await geminiService.findVisualMatch(base64, catalog);
                      onVisualResults(matchedIds);
                      setIsVisualAnalyzing(false);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-black transition-colors"
                  title="Visual Search"
                >
                  <svg className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse text-black' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <span className="text-zinc-400 text-[10px] uppercase tracking-widest pointer-events-none">Search</span>
              </div>
            </div>

            {/* Recent Searches */}
            {!searchQuery && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xs font-serif italic text-zinc-500">Recent</h3>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(localStorage.getItem('klyora_search_history') || '[]').map((term: string) => (
                    <button
                      key={term}
                      onClick={() => onSearchChange(term)}
                      className="px-3 py-1 bg-zinc-100 text-[10px] uppercase tracking-widest text-zinc-600 hover:bg-black hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Group: Sort */}
            <div className="space-y-4">
              <h3 className="text-xs font-serif italic text-zinc-500">Sort Curation</h3>
              <div className="flex flex-col gap-2 pl-2 border-l border-zinc-200">
                {[
                  { val: 'relevance', label: 'Featured Collection' },
                  { val: 'newest', label: 'Newest Arrivals' },
                  { val: 'price-asc', label: 'Price: Low to High' },
                  { val: 'price-desc', label: 'Price: High to Low' },
                  { val: 'name-asc', label: 'Alphabetical A-Z' },
                  { val: 'name-desc', label: 'Alphabetical Z-A' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => onSortChange(opt.val)}
                    className={`text-left text-[11px] uppercase tracking-widest font-bold transition-all duration-300 ${sortBy === opt.val ? 'text-black translate-x-2' : 'text-zinc-400 hover:text-zinc-600 hover:translate-x-1'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Group: Collection */}
            <div className="space-y-4">
              <h3 className="text-xs font-serif italic text-zinc-500">Collection</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onCategoryChange(null)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${!activeCategory ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-500 hover:border-black hover:text-black'}`}
                >
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${activeCategory === cat ? 'border-black bg-black text-white' : 'border-zinc-200 text-zinc-500 hover:border-black hover:text-black'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Group: Price */}
            <div className="space-y-4">
              <h3 className="text-xs font-serif italic text-zinc-500">Price Point</h3>
              <div className="flex flex-col gap-2">
                {PRICE_TIERS.map(tier => (
                  <label key={tier.label} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-3 h-3 rounded-full border border-zinc-300 transition-all flex items-center justify-center ${JSON.stringify(priceRange) === JSON.stringify(tier.range) ? 'border-black bg-black' : 'group-hover:border-zinc-400'}`}>
                      {JSON.stringify(priceRange) === JSON.stringify(tier.range) && <div className="w-1 h-1 bg-white rounded-full" />}
                    </div>
                    <button onClick={() => onPriceRangeChange(tier.range)} className={`text-[11px] uppercase tracking-widest font-bold transition-colors ${JSON.stringify(priceRange) === JSON.stringify(tier.range) ? 'text-black' : 'text-zinc-400 group-hover:text-black'}`}>
                      {tier.label}
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Palette */}
            <div className="space-y-4">
              <h3 className="text-xs font-serif italic text-zinc-500">Textile Palette</h3>
              <div className="grid grid-cols-6 gap-3">
                {allColors?.map(color => (
                  <button
                    key={color}
                    onClick={() => onColorChange(selectedColor === color ? null : color)}
                    className={`group relative w-8 h-8 rounded-full border border-zinc-100 shadow-sm flex items-center justify-center transition-all duration-300 ${selectedColor === color ? 'ring-1 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  >
                    {selectedColor === color && <div className="w-1.5 h-1.5 bg-white rounded-full mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Group: Availability */}
            <div className="pt-6 border-t border-zinc-200">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-[11px] uppercase tracking-widest font-bold text-zinc-600 group-hover:text-black transition-colors">Only In Stock</span>
                <div className="relative">
                  <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => onInStockChange(e.target.checked)} />
                  <div className={`w-10 h-5 rounded-full transition-all border ${inStockOnly ? 'bg-black border-black' : 'bg-transparent border-zinc-300'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full transition-all duration-300 ${inStockOnly ? 'bg-white translate-x-5' : 'bg-zinc-300'}`} />
                  </div>
                </div>
              </label>
            </div>

          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-8 md:p-12 md:pl-16">
            {/* Results Header */}
            <div className="flex items-end justify-between mb-16 border-b border-black/5 pb-6">
              <div>
                <h3 className="text-3xl md:text-4xl font-serif italic mb-2">
                  {searchQuery ? `"${searchQuery}"` : 'The Collection'}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  {resultsCount} {resultsCount === 1 ? 'Piece' : 'Pieces'} Curated
                </p>
              </div>
              {(searchQuery || activeCategory || priceRange || selectedMaterial || selectedColor || inStockOnly) && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onCategoryChange(null);
                    onPriceRangeChange(null);
                    onMaterialChange(null);
                    onColorChange(null);
                    onInStockChange(false);
                  }}
                  className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 border-b border-red-500/20 pb-1"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Grid */}
            {results && results.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {results.map(product => (
                  <div key={product.id} className="group cursor-pointer flex flex-col gap-4 animate-fade-in-up" onClick={onClose}>
                    <div className="aspect-[3/4] overflow-hidden bg-zinc-100 relative">
                      <BoutiqueImage
                        src={product.image}
                        alt={product.name}
                        aspectRatio="aspect-[3/4] h-full w-full"
                        className="object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                      />
                      {/* Quick Add Overlay */}
                      <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button className="w-full py-3 bg-white/90 backdrop-blur text-black text-[9px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1 group-hover:underline underline-offset-4 decoration-zinc-300">{product.name}</h4>
                      <p className="font-serif italic text-zinc-500 text-sm">{currency}{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center opacity-50">
                <span className="text-4xl mb-4 font-serif">?</span>
                <p className="font-serif italic text-xl mb-4">No pieces matched your specific curation.</p>
                <button onClick={() => { onSearchChange(''); onCategoryChange(null); onPriceRangeChange(null); }} className="text-xs uppercase tracking-widest underline underline-offset-4">Reset All Filters</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
