
import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../types';
import { BoutiqueImage } from './BoutiqueImage';

interface ProductCardProps {
    product: Product;
    currency: string;
    onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, currency, onClick }) => {
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
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-3">{product.composition || 'Premium Silhouette'}</p>
                </div>
                <span className="text-[15px] font-bold font-serif italic">{currency}{product.price}</span>
            </div>
        </div>
    );
};
