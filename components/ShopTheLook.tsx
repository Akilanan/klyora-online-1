import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { geminiService } from '../services/geminiService';

interface ShopTheLookProps {
    products: Product[];
    onProductClick: (p: Product) => void;
}

export const ShopTheLook: React.FC<ShopTheLookProps> = ({ products, onProductClick }) => {
    const [look, setLook] = useState<{ main: Product, secondary: Product, accessory: Product | null, rationale: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLook = async () => {
            // Prevent running if no products
            if (!products || products.length === 0) return;

            // Pick a random main product to start the curation
            // Prefer "Outerwear" or "Tops" as mains
            const candidates = products.filter(p => p.category !== 'Accessories');
            const main = candidates.length > 0
                ? candidates[Math.floor(Math.random() * candidates.length)]
                : products[0];

            // AI Style Call
            const styledLook = await geminiService.styleProduct(main, products);

            if (styledLook) {
                setLook(styledLook);
            } else {
                // Fallback to simple pairing if AI fails/offline
                const fallbackSecondary = products.find(p => p.id !== main.id) || main;
                setLook({
                    main,
                    secondary: fallbackSecondary,
                    accessory: null,
                    rationale: "A study in contrast and silhouette."
                });
            }
            setIsLoading(false);
        };

        fetchLook();
    }, [products.length]); // Only re-run if catalog changes drastically

    if (!look && !isLoading) return null;

    return (
        <section className="py-24 border-t border-white/5 bg-zinc-950">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    {/* Editorial Text */}
                    <div className="md:w-1/3 space-y-8 animate-fade-in-up">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[#8ca67a] border-l-2 border-[#8ca67a] pl-4">
                            AI Curated Ensemble
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">
                            The Daily <br />
                            <span className="text-zinc-500">Edit</span>
                        </h2>
                        {isLoading ? (
                            <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded"></div>
                        ) : (
                            <p className="text-zinc-400 font-light leading-relaxed text-sm max-w-sm">
                                {look?.rationale || "Elegance is refusal. A silhouette that commands respect."}
                            </p>
                        )}
                        <button className="text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/30 pb-2 hover:border-white transition-all">
                            View Full Editorial
                        </button>
                    </div>

                    {/* The Look Grid */}
                    <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse"></div>
                            ))
                        ) : (
                            <>
                                <div className="col-span-1">
                                    <ProductCard product={look!.main} currency="$" onClick={() => onProductClick(look!.main)} />
                                </div>
                                <div className="col-span-1 md:mt-12">
                                    <ProductCard product={look!.secondary} currency="$" onClick={() => onProductClick(look!.secondary)} />
                                </div>
                                {look!.accessory && (
                                    <div className="hidden md:block col-span-1 md:mt-24">
                                        <ProductCard product={look!.accessory} currency="$" onClick={() => onProductClick(look!.accessory)} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
