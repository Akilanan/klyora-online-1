
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { geminiService } from '../services/geminiService';
import { StyleRecommendations } from './StyleRecommendations';
import { BoutiqueImage } from './BoutiqueImage';
import { SizeRecommenderModal } from './SizeRecommenderModal';
import { ProductReviews } from './ProductReviews';
import { SimilarProducts } from './SimilarProducts';
import { analytics } from '../services/analytics';

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
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Reset selected variant when product changes
  useEffect(() => {
    if (product.variants?.length) {
      setSelectedVariant(product.variants[0]);
    }
    setActiveImage(product.image);

    // Track ViewContent
    analytics.viewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'GBP'
    });
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

  const [dealType, setDealType] = useState<'single' | 'bundle'>('bundle');

  const [openSection, setOpenSection] = useState<string | null>('senses');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-8 font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white shadow-2xl animate-fade-scale flex flex-col md:flex-row overflow-hidden h-full md:h-[75vh] md:max-h-[700px] md:rounded-sm">
        <button onClick={onClose} className="absolute top-4 right-4 z-[510] p-2 text-black/50 hover:text-black hover:rotate-90 transition-all duration-500 bg-white/80 backdrop-blur rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left: Product Imagery */}
        <div className="w-full md:w-1/2 bg-zinc-50 relative group overflow-hidden flex flex-col border-r border-black/5 p-8">
          <div className="flex-1 relative overflow-hidden h-full flex items-center justify-center">
            <BoutiqueImage
              src={activeImage || product.image}
              alt={product.name}
              aspectRatio="aspect-auto h-full w-full"
              className="transition-transform duration-[3s] ease-out scale-100 group-hover:scale-105 object-contain"
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-black/20 hover:text-black hover:bg-white/10 transition-all z-10"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = uniqueImages.indexOf(activeImage || product.image);
                    const nextIndex = (currentIndex + 1) % uniqueImages.length;
                    setActiveImage(uniqueImages[nextIndex]);
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-black/20 hover:text-black hover:bg-white/10 transition-all z-10"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Overlay - Simplified */}
          {uniqueImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 p-2 z-20">
              {uniqueImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(img); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${activeImage === img ? 'bg-black w-4' : 'bg-black/20 hover:bg-black/40'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Details (Fixed Header + Scroll + Footer) */}
        <div className="w-full md:w-1/2 flex flex-col bg-white text-black relative">

          {/* 1. Fixed Header */}
          <div className="p-8 border-b border-black/5 bg-white z-10 shrink-0">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-6 bg-black"></span>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-black">Klyora Atelier</span>
              </div>
              <div className="flex justify-between items-start">
                <h2 className="text-2xl md:text-3xl font-serif italic font-medium tracking-tight text-black leading-tight pr-8">{product.name}</h2>
                <button onClick={onToggleSave} className="p-1 hover:text-red-500 transition-colors">
                  {isSaved ? (
                    <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  )}
                </button>
              </div>
              <div className="flex items-baseline gap-4 flex-col items-end">
                <div className="text-right">
                  <p className="text-xl font-sans font-light tracking-wide text-zinc-900">
                    <span className="line-through text-zinc-400 text-sm mr-2">{currency}{Math.round(product.price * 1.4).toLocaleString()}</span>
                    {currency}{product.price.toLocaleString()}
                  </p>
                  <p className="text-[9px] uppercase tracking-widest text-[#8ca67a] font-bold">Member Price</p>
                </div>
                {(product.lowStock || (product.reviews && product.reviews > 10)) && (
                  <p className="text-[10px] text-red-800 uppercase tracking-widest font-bold animate-pulse">
                    {product.lowStock ? 'Low Stock: Only 3 Left' : 'High Demand: Selling Fast'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Sizing */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Select Size</span>
                <button
                  onClick={() => setIsSizeModalOpen(true)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] font-bold text-white bg-black px-3 py-1.5 hover:bg-zinc-800 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Find My Fit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants?.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => variant.available && setSelectedVariant(variant)}
                    disabled={!variant.available}
                    className={`min-w-[3.5rem] h-10 px-3 border text-[10px] font-medium transition-all duration-300 flex items-center justify-center ${!variant.available ? 'opacity-30 cursor-not-allowed line-through bg-zinc-50 border-zinc-100' : selectedVariant?.id === variant.id ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black text-black bg-transparent'}`}
                  >
                    {variant.title}
                  </button>
                )) || <span className="text-sm text-zinc-400 px-2 italic">Universal Fit</span>}
              </div>
            </div>

            {/* DECOY EFFECT: Bundle Offers */}
            <div className="bg-zinc-50 p-6 border border-black/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-black text-white text-[9px] px-3 py-1 uppercase tracking-widest font-bold">Best Value</div>
              <h4 className="font-serif italic text-lg mb-4">Upgrade Your Experience</h4>

              <div className="space-y-3">
                {/* Option 1: Decoy (Single Item) */}
                <label onClick={() => setDealType('single')} className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${dealType === 'single' ? 'border-black bg-white opacity-100' : 'border-black/10 bg-white/50 opacity-60 hover:opacity-100'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="bundle" checked={dealType === 'single'} onChange={() => setDealType('single')} className="accent-black" />
                    <span className="text-xs uppercase tracking-wide">Standard Shipping</span>
                  </div>
                  <span className="text-xs font-bold">{currency}{product.price}</span>
                </label>

                {/* Option 2: The Winner (Bundle) */}
                <label onClick={() => setDealType('bundle')} className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${dealType === 'bundle' ? 'border-black bg-white shadow-lg scale-105 z-10' : 'border-black/10 bg-white/50 opacity-80 hover:opacity-100 scale-100'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="bundle" checked={dealType === 'bundle'} onChange={() => setDealType('bundle')} className="accent-black" />
                    <div>
                      <span className="text-xs uppercase tracking-wide font-bold block">VIP Protection (Priority + Insurance)</span>
                      <span className="text-[9px] text-[#8ca67a] uppercase tracking-wider">Most Popular</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold">{currency}{Math.round(product.price * 1.15)}</span>
                    <span className="text-[10px] line-through text-zinc-400">{currency}{Math.round(product.price * 1.3)}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Accordion Details */}
            <div className="space-y-0 border-t border-black/10">
              {/* Senses */}
              <div className="border-b border-black/10">
                <button
                  onClick={() => toggleSection('senses')}
                  className="w-full py-4 flex justify-between items-center text-left group"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-zinc-600 transition-colors">The Senses & Composition</span>
                  <span className={`text-lg font-light transition-transform duration-300 ${openSection === 'senses' ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection === 'senses' ? 'max-h-[1000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4 text-xs text-zinc-600 font-light leading-relaxed pt-2">
                    {product.description ? (
                      product.description.split('\n')
                        .map(l => l.trim())
                        .filter(l => l.length > 0)
                        .map((line, i) => {
                          const isHeader = (line.includes(':') && line.length < 40) || (line.length < 20 && line === line.toUpperCase());
                          if (isHeader) {
                            return (
                              <div key={i} className="mt-4 mb-2">
                                <h4 className="font-serif italic text-black text-base border-l-2 border-[#8ca67a] pl-3 inline-block">
                                  {line}
                                </h4>
                              </div>
                            );
                          }
                          return <p key={i} className="text-zinc-500">{line}</p>;
                        })
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 grid grid-cols-2 gap-4">
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

              {/* Shipping */}
              <div className="border-b border-black/10">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full py-4 flex justify-between items-center text-left group"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-zinc-600 transition-colors">Shipping & Returns</span>
                  <span className={`text-lg font-light transition-transform duration-300 ${openSection === 'shipping' ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection === 'shipping' ? 'max-h-[300px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                  <p className="text-xs font-light text-zinc-600 leading-relaxed">
                    Global Shipping (7-15 Business Days) on all orders.
                    Returns accepted within 14 days.
                  </p>
                </div>
              </div>

              {/* Client Reflections / Reviews */}
              <div className="border-b border-black/10">
                <button
                  onClick={() => toggleSection('reviews')}
                  className="w-full py-4 flex justify-between items-center text-left group"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-zinc-600 transition-colors">Client Reflections</span>
                  <span className={`text-lg font-light transition-transform duration-300 ${openSection === 'reviews' ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSection === 'reviews' ? 'max-h-[800px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-4">
                    <ProductReviews productName={product.name} />
                  </div>
                </div>
              </div>
            </div>

            {/* Cross Sells */}
            <div className="pt-4">
              <SimilarProducts
                currentProductId={product.id}
                products={allProducts}
                currency={currency}
              />
            </div>
          </div>

          {/* 3. Fixed Footer */}
          <div className="p-6 bg-white border-t border-black/5 z-20 shrink-0">
            <button
              onClick={() => {
                if (selectedVariant) {
                  // 1. Add Main Product
                  onAddToCart(product, selectedVariant);

                  // 2. If Service Bundle Selected, Add Insurance Product
                  if (dealType === 'bundle') {
                    const insuranceProduct: any = {
                      id: 'service-vip-protection',
                      name: 'VIP Protection & Priority Dispath',
                      price: Math.round(product.price * 0.15),
                      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop', // Abstract/Premium image
                      category: 'Exclusive',
                      description: 'Insured shipping and priority handling.',
                      descriptionHtml: '<p>Priority Handling</p>',
                      images: [],
                      variants: [{ id: 'vip-service', title: 'Service', price: Math.round(product.price * 0.15), available: true }]
                    };
                    // Add with a small delay to ensure order in simulated cart
                    setTimeout(() => {
                      onAddToCart(insuranceProduct, insuranceProduct.variants[0]);
                    }, 100);
                  }

                  analytics.addToCart({
                    id: product.id,
                    name: product.name,
                    price: dealType === 'bundle' ? Math.round(product.price * 1.15) : product.price,
                    variant: selectedVariant.title + (dealType === 'bundle' ? ' (+ VIP Service)' : ''),
                    currency: currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'GBP'
                  });
                }
              }}
              disabled={!selectedVariant}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all rounded-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              <span>{selectedVariant ? `Add to Bag - ${currency}${(dealType === 'bundle' ? Math.round(product.price * 1.15) : product.price).toLocaleString()}` : 'Select Size'}</span>
              {selectedVariant && <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>}
            </button>
          </div>
        </div>
      </div>

      <SizeRecommenderModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        productName={product.name}
      />
    </div >
  );
};
