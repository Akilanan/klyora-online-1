
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { BoutiqueImage } from './BoutiqueImage';
import { zendropService } from '../services/zendropService';

interface ProductCardProps {
    product: Product;
    currency: string;
    onClick: () => void;
    isSaved?: boolean;
    onToggleSave?: (e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, currency, onClick, isSaved, onToggleSave }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Combine main image and gallery images, ensuring uniqueness
    const allImages = React.useMemo(() => {
        const images = [product.image];
        if (product.images) {
            product.images.forEach(img => {
                if (!images.includes(img)) {
                    images.push(img);
                }
            });
        }
        return images;
    }, [product]);

    const [supplierInfo, setSupplierInfo] = useState<any>(null);

    useEffect(() => {
        zendropService.getSupplierInfo(product).then(setSupplierInfo);
    }, [product]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered && allImages.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % allImages.length);
            }, 1500); // Change image every 1.5 seconds on hover
        } else {
            setCurrentImageIndex(0);
        }

        return () => clearInterval(interval);
    }, [isHovered, allImages]);

    return (
        <div
            className="group cursor-pointer animate-fade-scale"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative mb-4 overflow-hidden bg-zinc-900 aspect-[3/4]">
                {allImages.map((img, idx) => (
                    <div
                        key={img}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <BoutiqueImage
                            src={img}
                            alt={`${product.name} - View ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                        />
                    </div>
                ))}

                <div className="absolute inset-0 z-20 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-[9px] uppercase tracking-[0.5em] font-bold border border-white/20 px-10 py-4">View Detail</span>
                </div>

                {/* Low Stock Badge */}
                {(product as any).lowStock && (
                    <div className="absolute top-4 left-4 z-30 bg-red-900/80 backdrop-blur-sm text-red-100 px-3 py-1 text-[8px] uppercase tracking-widest font-bold animate-pulse">
                        Only 2 Left
                    </div>
                )}

                {/* Save Button */}
                <div className="absolute top-4 right-4 z-30 flex gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                    {/* Pinterest Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.name)}`, '_blank');
                        }}
                        className="w-8 h-8 rounded-full bg-white text-[#E60023] flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        title="Pin to Moodboard"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.487-.69-2.432-2.864-2.432-4.632 0-3.77 2.748-7.229 7.951-7.229 4.173 0 7.41 2.967 7.41 6.923 0 4.133-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" /></svg>
                    </button>

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(e); }}
                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                        {isSaved ? (
                            <svg className="w-4 h-4 text-black fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        )}
                    </button>
                </div>

                {/* Slideshow Progress Indicators */}
                {isHovered && allImages.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {allImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-0.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-2 bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start px-2">
                <div className="flex-1">
                    <h3 className="text-[13px] uppercase font-bold tracking-[0.3em] text-white/90">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2 opacity-60">
                        {/* Dynamic Stars */}
                        <div className="flex text-[#8ca67a] text-[8px]">
                            {(() => {
                                // Explicit Stats from Data
                                const baseRating = (product as any).rating || 5.0;
                                const baseCount = (product as any).reviews || 0;

                                // Local overrides
                                let localReviews = [];
                                try {
                                    const saved = localStorage.getItem(`klyora_reviews_${product.name}`);
                                    localReviews = saved ? JSON.parse(saved) : [];
                                    if (!Array.isArray(localReviews)) localReviews = [];
                                } catch (e) {
                                    console.warn('Failed to parse local reviews', e);
                                    localReviews = [];
                                }
                                const totalCount = baseCount + localReviews.length;

                                // Recalculate average with local reviews
                                let sum = baseCount * baseRating;
                                localReviews.forEach((r: any) => sum += r.rating);
                                const finalRating = totalCount > 0 ? sum / totalCount : 0;
                                const displayRating = Math.min(5, Math.max(0, finalRating));

                                return (
                                    <>
                                        <div className="flex relative">
                                            <span className="text-zinc-600">★★★★★</span>
                                            <span className="absolute left-0 top-0 overflow-hidden text-[#8ca67a]" style={{ width: `${(displayRating / 5) * 100}%` }}>★★★★★</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        {/* Count */}
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500">
                            ({((product as any).reviews || 0) + (localStorage.getItem(`klyora_reviews_${product.name}`) ? JSON.parse(localStorage.getItem(`klyora_reviews_${product.name}`)!).length : 0)})
                        </span>
                    </div>
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-3 flex items-center justify-between">
                        <span>{product.composition || 'Premium Silhouette'}</span>
                        {supplierInfo && (
                            <span className="text-[#8ca67a] flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#8ca67a] animate-pulse"></span>
                                Ships in {supplierInfo.shippingTime}
                            </span>
                        )}
                    </p>
                    <div className="flex justify-between items-center mt-3 border-t border-black/5 pt-3">
                        <span className="text-[15px] font-bold font-serif italic">{product.formattedPrice || `${currency}${product.price.toLocaleString()}`}</span>
                        <div className="text-[8px] text-right">
                            <span className="text-zinc-400 block uppercase tracking-widest">Est. Archive Value</span>
                            <span className="font-serif italic text-zinc-500">{currency}{Math.round(product.price * 0.85).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
