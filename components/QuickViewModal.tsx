
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { geminiService } from '../services/geminiService';
import { StyleRecommendations } from './StyleRecommendations';
import { BoutiqueImage } from './BoutiqueImage';
import { FitAssistant } from './FitAssistant';
import { ProductReviews } from './ProductReviews';
import { SimilarProducts } from './SimilarProducts';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product, variant: ProductVariant) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ 
  product, 
  onClose, 
  onAddToCart 
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [isFitAssistantOpen, setIsFitAssistantOpen] = useState(false);

  // Reset selected variant when product changes
  useEffect(() => {
    if (product.variants?.length) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const handleApplySize = (sizeTitle: string) => {
    const variant = product.variants?.find(v => v.title === sizeTitle);
    if (variant) setSelectedVariant(variant);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-8">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-7xl bg-white shadow-2xl animate-fade-scale flex flex-col md:flex-row overflow-hidden h-full md:h-[90vh] border border-white/5">
        <button onClick={onClose} className="absolute top-8 right-8 z-[510] p-3 mix-blend-difference hover:rotate-90 transition-all duration-700 text-white/60 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Product Imagery */}
        <div className="w-full md:w-1/2 bg-zinc-100 relative group overflow-hidden">
          <BoutiqueImage 
            src={product.image} 
            alt={product.name} 
            aspectRatio="aspect-auto h-full w-full"
            className="transition-all duration-[3s] ease-out scale-100 group-hover:scale-105" 
          />
        </div>

        {/* Right: Scrollable Details */}
        <div className="w-full md:w-1/2 flex flex-col bg-white text-black overflow-y-auto no-scrollbar">
          <div className="p-10 md:p-20 space-y-20 pb-32">
            
            {/* 1. Header & Price */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[9px] uppercase tracking-[0.6em] text-[#8ca67a] font-bold">KLYORA ATELIER</span>
                <span className="text-[7px] text-zinc-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-black/5">
                  Exclusive Design
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-serif uppercase tracking-tighter leading-[0.9] text-black">{product.name}</h2>
              <div className="flex items-center justify-between pt-4 border-t border-black/5">
                <p className="text-[20px] font-bold tracking-[0.1em] text-black font-serif italic">${product.price.toLocaleString()} USD</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Complimentary Duty</p>
              </div>
            </div>

            {/* 2. Narrative */}
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.4em] text-zinc-300">The Senses</h4>
              <p className="text-[16px] leading-[1.8] text-zinc-800 font-serif italic font-light">
                {product.description || "A masterwork of contemporary silhouette, this piece is defined by architectural precision and fluid grace. Crafted for the modern luminary who values the intersection of traditional atelier craftsmanship and digital era elegance."}
              </p>
            </div>

            {/* 3. Sizing & Consultation */}
            <div className="space-y-8 p-10 bg-zinc-50 border border-black/5">
              <div className="flex justify-between items-baseline">
                <h4 className="text-[10px] uppercase font-bold tracking-[0.3em]">Select Silhouette Size</h4>
                <button 
                  onClick={() => setIsFitAssistantOpen(true)}
                  className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#8ca67a] hover:opacity-60 transition-opacity"
                >
                  Tailoring Advice
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants?.map(variant => (
                  <button 
                    key={variant.id}
                    onClick={() => variant.available && setSelectedVariant(variant)}
                    disabled={!variant.available}
                    className={`px-8 py-4 border text-[10px] font-bold uppercase tracking-widest transition-all ${!variant.available ? 'opacity-10 cursor-not-allowed line-through' : selectedVariant?.id === variant.id ? 'bg-black text-white border-black shadow-xl' : 'border-black/10 hover:border-black'}`}
                  >
                    {variant.title}
                  </button>
                )) || <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">Universal Fitment</span>}
              </div>
            </div>

            {/* 4. Specifications */}
            <div className="space-y-8">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.4em] text-zinc-300">Technical Attributes</h4>
              <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                <div className="space-y-2">
                  <p className="text-[8px] uppercase font-bold tracking-[0.3em] text-zinc-400">Materiality</p>
                  <p className="text-[12px] uppercase tracking-widest font-medium text-black">{product.composition || "Premium Fiber Blend"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] uppercase font-bold tracking-[0.3em] text-zinc-400">Origins</p>
                  <p className="text-[12px] uppercase tracking-widest font-medium text-black">{product.origin || "Atelier Paris"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] uppercase font-bold tracking-[0.3em] text-zinc-400">Fulfillment</p>
                  <p className="text-[12px] uppercase tracking-widest font-medium text-black">{product.shippingTier || "White Glove Express"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] uppercase font-bold tracking-[0.3em] text-zinc-400">Maintenance</p>
                  <p className="text-[12px] uppercase tracking-widest font-medium text-black">Atelier Care Advised</p>
                </div>
              </div>
            </div>

            {/* 5. Curation Tools */}
            <StyleRecommendations product={product} />

            {/* 6. Reflections */}
            <div className="pt-20 border-t border-black/5">
              <ProductReviews productName={product.name} />
            </div>

            {/* 7. Curated Pairings */}
            <div className="pt-20 border-t border-black/5">
              <SimilarProducts currentProductId={product.id} relatedIds={product.relatedIds} />
            </div>
          </div>

          {/* Persistent Bag Integration */}
          <div className="mt-auto pt-8 pb-12 px-10 md:px-20 bg-white/90 backdrop-blur-xl sticky bottom-0 border-t border-black/5 z-20">
            <button 
              onClick={() => selectedVariant ? onAddToCart(product, selectedVariant) : null}
              disabled={!selectedVariant}
              className="w-full bg-black text-white py-7 text-[11px] font-bold uppercase tracking-[0.6em] hover:bg-zinc-800 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-20"
            >
              {selectedVariant ? 'Add to Private Collection' : 'Select Silhouette'}
            </button>
          </div>
        </div>
      </div>

      {isFitAssistantOpen && (
        <FitAssistant 
          product={product} 
          onClose={() => setIsFitAssistantOpen(false)} 
          onApplySize={handleApplySize} 
        />
      )}
    </div>
  );
};
