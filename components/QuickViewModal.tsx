
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
    return Array.from(new Set(imgs)); // Extra safety
  }, [product]);

  // SMART VARIANT PARSING
  // Detect if variants are "Option1 / Option2" (e.g. Size / Color)
  const variantStructure = React.useMemo(() => {
    if (!product.variants || product.variants.length === 0) return { type: 'simple', options: [] };

    const firstTitle = product.variants[0].title;
    if (firstTitle.includes(' / ')) {
      // Complex variants
      return { type: 'complex' };
    }
    return { type: 'simple' };
  }, [product]);

  // Extract unique Sizes and Colors if complex
  const variantOptions = React.useMemo(() => {
    if (variantStructure.type === 'simple') return null;

    const sizes = new Set<string>();
    const colors = new Set<string>();

    product.variants?.forEach(v => {
      const parts = v.title.split(' / ');
      if (parts.length >= 1) sizes.add(parts[0]);
      if (parts.length >= 2) colors.add(parts[1]);
    });

    return {
      sizes: Array.from(sizes),
      colors: Array.from(colors)
    };
  }, [product, variantStructure]);

  // State for separate selections
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Initialize selections when product opens
  useEffect(() => {
    if (variantStructure.type === 'complex' && product.variants?.length) {
      const firstParts = product.variants[0].title.split(' / ');
      setSelectedSize(firstParts[0]);
      if (firstParts.length > 1) setSelectedColor(firstParts[1]);
    }
  }, [product, variantStructure]);

  // Effect: Find the actual variant object when Size/Color changes
  useEffect(() => {
    if (variantStructure.type === 'complex' && selectedSize && selectedColor) {
      const matchingVariant = product.variants?.find(v =>
        v.title === `${selectedSize} / ${selectedColor}` ||
        v.title === `${selectedSize} / ${selectedColor} /` // Handle potential trailing slack issues
      );
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      }
    }
  }, [selectedSize, selectedColor, product]);

  const handleApplySize = (sizeTitle: string) => {
    // Override for simple mode compatibility
    if (variantStructure.type === 'simple') {
      const variant = product.variants?.find(v => v.title === sizeTitle);
      if (variant) setSelectedVariant(variant);
    } else {
      setSelectedSize(sizeTitle);
    }
  };



  const [openSection, setOpenSection] = useState<string | null>('senses');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-8 font-sans">
      {/* SEO: Rich Snippets (Structured Data) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": product.images || [product.image],
          "description": product.description || `Luxury ${product.name} from Maison Klyora.`,
          "brand": {
            "@type": "Brand",
            "name": "Maison Klyora"
          },
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'GBP',
            "price": product.price,
            "availability": (product.variants?.some(v => v.available) ?? true) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        })}
      </script>

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

                {/* [TRUST] Visible Shipping & Security - CRO ENHANCED */}
                <div className="flex flex-col items-end gap-2 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#8ca67a]/10 rounded border border-[#8ca67a]/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8ca67a] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8ca67a]"></span>
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#8ca67a] font-bold">In Stock & Ready to Ship</span>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                      <svg className="w-3 h-3 text-[#8ca67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      <span>Quality Checked</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                      <svg className="w-3 h-3 text-[#8ca67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <span>Verified Secure</span>
                    </div>
                  </div>
                </div>
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
                {variantStructure.type === 'simple' ? (
                  // SIMPLE MODE (Original)
                  product.variants?.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => variant.available && setSelectedVariant(variant)}
                      disabled={!variant.available}
                      className={`min-w-[3.5rem] h-10 px-3 border text-[10px] font-medium transition-all duration-300 flex items-center justify-center ${!variant.available ? 'opacity-30 cursor-not-allowed line-through bg-zinc-50 border-zinc-100' : selectedVariant?.id === variant.id ? 'bg-black text-white border-black' : 'border-zinc-200 hover:border-black text-black bg-transparent'}`}
                    >
                      {variant.title}
                    </button>
                  )) || <span className="text-sm text-zinc-400 px-2 italic">Universal Fit</span>
                ) : (
                  // COMPLEX MODE (Split Color/Size)
                  <div className="w-full space-y-6">
                    {/* 1. Colors */}
                    {variantOptions?.colors && variantOptions.colors.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-400">Select Color: <span className="text-black font-bold">{selectedColor}</span></span>
                        <div className="flex flex-wrap gap-2">
                          {variantOptions.colors.map(color => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`px-4 py-2 text-[10px] border transition-all ${selectedColor === color ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-200 hover:border-black'}`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Sizes */}
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-400">Select Size: <span className="text-black font-bold">{selectedSize}</span></span>
                      <div className="flex flex-wrap gap-2">
                        {variantOptions?.sizes.map(size => {
                          // Check availability for this size with CURRENTLY selected color
                          const variantForCheck = product.variants?.find(v => v.title === `${size} / ${selectedColor}`);
                          const isAvailable = variantForCheck?.available ?? false;

                          return (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              // disabled={!isAvailable} // Optional: we might want to just show it as OOS but selectable
                              className={`min-w-[3rem] h-10 px-3 border text-[10px] font-medium transition-all flex items-center justify-center 
                                                ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-200 hover:border-black'}
                                                ${!isAvailable ? 'opacity-50 relative overflow-hidden' : ''}
                                            `}
                            >
                              {size}
                              {!isAvailable && <span className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-zinc-400 rotate-45"></div></span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
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
                    Global Priority Shipping (Fully Tracked).
                    <br />
                    <span className="text-[#8ca67a] font-bold">Easy Returns:</span> Keep what you love, return what you don't within 14 days.
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
            {selectedVariant && !selectedVariant.available ? (
              <button
                onClick={() => {
                  const email = prompt("Enter your email to be notified when this piece returns to the atelier:");
                  if (email) {
                    const existing = JSON.parse(localStorage.getItem('klyora_waitlist') || '[]');
                    existing.push({ email, product: product.name, date: new Date().toISOString() });
                    localStorage.setItem('klyora_waitlist', JSON.stringify(existing));
                    alert(`You have been added to the priority waitlist for ${product.name}. We will contact you at ${email}.`);
                  }
                }}
                className="w-full bg-zinc-900/50 text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-900 transition-all rounded-none flex items-center justify-center gap-3 backdrop-blur-md"
              >
                <span>Join Waitlist</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" /></svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (selectedVariant) {
                    // Add Main Product
                    onAddToCart(product, selectedVariant);

                    analytics.addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      variant: selectedVariant.title,
                      currency: currency === '$' ? 'USD' : currency === '€' ? 'EUR' : 'GBP'
                    });
                  }
                }}
                disabled={!selectedVariant}
                className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all rounded-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                <span>{selectedVariant ? `Add to Bag - ${currency}${product.price.toLocaleString()}` : 'Select Size'}</span>
                {selectedVariant && <span className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>}
              </button>
            )}

            <div className="flex justify-center gap-4 mt-3 opacity-40">
              {/* Simple SVG Placeholders for payment icons to reduce noise, or small text */}
              <span className="text-[8px] uppercase tracking-widest font-bold">Encrypted via Shopify</span>
              <span className="flex gap-2">
                {['VISA', 'MC', 'AMEX'].map(c => <span key={c} className="text-[8px] font-serif italic">{c}</span>)}
              </span>
            </div>
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
