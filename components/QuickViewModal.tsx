
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
  allProducts: Product[];
  onClose: () => void;
  onAddToCart: (p: Product, variant: ProductVariant) => void;
  currency?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  allProducts,
  onClose,
  onAddToCart,
  currency = '$',
  isSaved,
  onToggleSave
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [activeImage, setActiveImage] = useState<string | null>(product.image);
  const [isFitAssistantOpen, setIsFitAssistantOpen] = useState(false);

  // Reset selected variant when product changes
  useEffect(() => {
    if (product.variants?.length) {
      setSelectedVariant(product.variants[0]);
    }
    setActiveImage(product.image);
  }, [product]);

  const uniqueImages = React.useMemo(() => {
    const imgs = [product.image];
    if (product.images) {
      product.images.forEach(img => {
        if (!imgs.includes(img) && img !== product.image) {
          imgs.push(img);
        }
      });
    }
    return Array.from(new Set(imgs)); // Extra safety
  }, [product]);

  const handleApplySize = (sizeTitle: string) => {
    const variant = product.variants?.find(v => v.title === sizeTitle);
    if (variant) setSelectedVariant(variant);
  };

  const [openSection, setOpenSection] = useState<string | null>('senses');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-8 font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-7xl bg-white shadow-2xl animate-fade-scale flex flex-col md:flex-row overflow-hidden h-full md:h-[90vh] md:rounded-sm">
        <button onClick={onClose} className="absolute top-6 right-6 z-[510] p-3 text-black/50 hover:text-black hover:rotate-90 transition-all duration-500 bg-white/80 backdrop-blur rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Product Imagery */}
        <div className="w-full md:w-1/2 bg-zinc-50 relative group overflow-hidden flex flex-col">
          <div className="flex-1 relative overflow-hidden h-full">
            <BoutiqueImage
              src={activeImage || product.image}
              alt={product.name}
              aspectRatio="aspect-auto h-full w-full"
              className="transition-transform duration-[3s] ease-out scale-100 group-hover:scale-105 object-cover"
            />
            {uniqueImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = uniqueImages.indexOf(activeImage || product.image);
                    const prevIndex = currentIndex <= 0 ? uniqueImages.length - 1 : currentIndex - 1;
                    setActiveImage(uniqueImages[prevIndex]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-black bg-white/50 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = uniqueImages.indexOf(activeImage || product.image);
                    const nextIndex = (currentIndex + 1) % uniqueImages.length;
                    setActiveImage(uniqueImages[nextIndex]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-black bg-white/50 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Overlay */}
          {uniqueImages.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 p-4 z-20">
              {uniqueImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(img); }}
                  className={`w-14 aspect-[3/4] border transition-all duration-300 shadow-lg ${activeImage === img ? 'border-black ring-1 ring-black scale-110 opacity-100' : 'border-white/50 opacity-80 hover:opacity-100 hover:scale-105'} bg-white overflow-hidden`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Scrollable Details */}
        <div className="w-full md:w-1/2 flex flex-col bg-white text-black relative">
          <div className="flex-1 overflow-y-auto no-scrollbar p-10 md:p-14 space-y-12 pb-32">

            {/* 1. Header & Price */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-8 bg-black"></span>
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-black">Klyora Atelier</span>
              </div>
              <div className="flex justify-between items-start">
                <h2 className="text-4xl md:text-5xl font-serif italic font-medium tracking-tight text-black leading-tight">{product.name}</h2>
                <button onClick={onToggleSave} className="p-2 hover:text-red-500 transition-colors">
                  {isSaved ? (
                    <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  )}
                </button>
              </div>
              <div className="flex items-baseline gap-4 pt-2">
                <p className="text-2xl font-sans font-light tracking-wide text-zinc-900">{currency}{product.price.toLocaleString()}</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Import Duties Included</p>
              </div>
            </div>



            {/* 2. Sizing */}
            <div className="space-y-6">
              <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Select Size</span>
                <button
                  onClick={() => setIsFitAssistantOpen(true)}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8ca67a] hover:underline underline-offset-4"
                >
                  Size Guide
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.variants?.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => variant.available && setSelectedVariant(variant)}
                  disabled={!variant.available}
                  className={`min-w-[4rem] h-12 px-4 border text-[11px] font-medium transition-all duration-300 flex items-center justify-center ${!variant.available ? 'opacity-30 cursor-not-allowed line-through bg-zinc-50 border-zinc-100' : selectedVariant?.id === variant.id ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black text-black bg-transparent'}`}
                >
                  {variant.title}
                </button>
              )) || <span className="text-sm text-zinc-400 px-2 italic">Universal Fit</span>}
            </div>
          </div>

          {/* 3. Accordion Details */}
          <div className="space-y-0 border-t border-black/10">
            {/* The Senses (Description) */}
            <div className="border-b border-black/10">
              <button
                onClick={() => toggleSection('senses')}
                className="w-full py-6 flex justify-between items-center text-left group"
              >
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold group-hover:text-zinc-600 transition-colors">The Senses & Composition</span>
                <span className={`text-xl font-light transition-transform duration-300 ${openSection === 'senses' ? 'rotate-45' : ''}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection === 'senses' ? 'max-h-[1000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4 text-sm text-zinc-600 font-light leading-relaxed">
                  {product.description ? (
                    product.description.split('\n').map((line, i) => {
                      const cleanLine = line.trim();
                      if (!cleanLine) return null;
                      // Stricter check: Only short labels (approx 5-6 words) get header styling
                      if (cleanLine.includes(':') && cleanLine.length < 35) {
                        return (
                          <p key={i} className="font-serif italic text-black text-lg mt-5 mb-1 border-l-2 border-[#8ca67a] pl-4">
                            {cleanLine}
                          </p>
                        );
                      }
                      return <p key={i}>{cleanLine}</p>;
                    })
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-dashed border-zinc-200 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">Material</p>
                    <p className="text-xs">{product.composition || "Premium Blend"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-1">Origin</p>
                    <p className="text-xs">{product.origin || "Italy"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Returns */}
            <div className="border-b border-black/10">
              <button
                onClick={() => toggleSection('shipping')}
                className="w-full py-6 flex justify-between items-center text-left group"
              >
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold group-hover:text-zinc-600 transition-colors">Shipping & Returns</span>
                <span className={`text-xl font-light transition-transform duration-300 ${openSection === 'shipping' ? 'rotate-45' : ''}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection === 'shipping' ? 'max-h-[300px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm font-light text-zinc-600 leading-relaxed">
                  Complimentary {product.shippingTier || "Standard"} shipping on all orders over $500.
                  Returns are accepted within 14 days of delivery for a full refund or exchange, provided items are unworn and tags are attached.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Cross Sells */}
          <div className="pt-8">
            <SimilarProducts
              currentProductId={product.id}
              products={allProducts}
              currency={currency}
            />
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur border-t border-black/5 z-20">
          <button
            onClick={() => selectedVariant ? onAddToCart(product, selectedVariant) : null}
            disabled={!selectedVariant}
            className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all rounded-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            <span>{selectedVariant ? `Add to Bag - ${currency}${product.price}` : 'Select Size'}</span>
            {selectedVariant && <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>}
          </button>
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
