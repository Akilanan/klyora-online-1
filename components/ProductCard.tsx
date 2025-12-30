
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
            <div className="relative mb-12 overflow-hidden bg-zinc-900 aspect-[3/4]">
                {allImages.map((img, idx) => (
                    <div
                        key={img}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <BoutiqueImage
                            src={img}
                            alt={`${product.name} - View ${idx + 1}`}
                            className="group-hover:scale-110 transition-transform duration-[3s]"
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
                <button
                    onClick={onToggleSave}
                    className="absolute top-4 right-4 z-30 p-2 text-white/50 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                >
                    {isSaved ? (
                        <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    )}
                </button>

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
                                // Calculate dynamic rating
                                const saved = localStorage.getItem(`klyora_reviews_${product.name}`);
                                const localReviews = saved ? JSON.parse(saved) : [];
                                const totalReviews = ((product as any).reviews || 12) + localReviews.length;

                                // Mock average for base (mostly 5s in luxury) + local variance
                                let sum = ((product as any).reviews || 12) * 5;
                                localReviews.forEach((r: any) => sum += r.rating);
                                const avg = sum / totalReviews;

                                return (
                                    <>
                                        {'★'.repeat(Math.round(avg))}
                                        <span className="text-zinc-600 ml-1">{'★'.repeat(5 - Math.round(avg))}</span>
                                    </>
                                );
                            })()}
                        </div>
                        {/* Count */}
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500">
                            ({((product as any).reviews || 12) + (localStorage.getItem(`klyora_reviews_${product.name}`) ? JSON.parse(localStorage.getItem(`klyora_reviews_${product.name}`)!).length : 0)})
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
                </div>
                <span className="text-[15px] font-bold font-serif italic">{product.formattedPrice || `${currency}${product.price.toLocaleString()}`}</span>
            </div>
        </div>
    );
};
