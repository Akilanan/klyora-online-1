import React, { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ShopTheLookProps {
    products: Product[];
    onProductClick: (p: Product) => void;
}

export const ShopTheLook: React.FC<ShopTheLookProps> = ({ products, onProductClick }) => {
    // Group products into "Looks" roughly by category logic or random curation for now
    // In a real scenario, this would be manually curated data.
    // For now, we create a "Business Heritage" look if we find Blazers + Trousers.

    // Filter logic mimicking curation
    const blazers = products.filter(p => p.name.toLowerCase().includes('blazer') || p.name.toLowerCase().includes('jacket'));
    const trousers = products.filter(p => p.name.toLowerCase().includes('trouser') || p.name.toLowerCase().includes('pant'));
    const tops = products.filter(p => p.name.toLowerCase().includes('shirt') || p.name.toLowerCase().includes('blouse'));

    if (blazers.length === 0 || trousers.length === 0) return null;

    const featuredLook = {
        main: blazers[0],
        secondary: trousers[0],
        accessory: tops.length > 0 ? tops[0] : null
    };

    return (
        <section className="py-24 border-t border-white/5 bg-zinc-950">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    {/* Editorial Text */}
                    <div className="md:w-1/3 space-y-8">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-[#8ca67a] border-l-2 border-[#8ca67a] pl-4">
                            Curated Ensemble
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif italic text-white leading-tight">
                            The Sunday <br />
                            <span className="text-zinc-500">Uniform</span>
                        </h2>
                        <p className="text-zinc-400 font-light leading-relaxed text-sm max-w-sm">
                            Elegance is refusal. We have paired our structured heritage blazer with fluid trousers to create a silhouette that commands respect without demanding attention.
                        </p>
                        <button className="text-[10px] uppercase tracking-[0.3em] text-white border-b border-white/30 pb-2 hover:border-white transition-all">
                            View Full Editorial
                        </button>
                    </div>

                    {/* The Look Grid */}
                    <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="col-span-1">
                            <ProductCard product={featuredLook.main} currency="$" onClick={() => onProductClick(featuredLook.main)} />
                        </div>
                        <div className="col-span-1 md:mt-12">
                            <ProductCard product={featuredLook.secondary} currency="$" onClick={() => onProductClick(featuredLook.secondary)} />
                        </div>
                        {featuredLook.accessory && (
                            <div className="hidden md:block col-span-1 md:mt-24">
                                <ProductCard product={featuredLook.accessory} currency="$" onClick={() => onProductClick(featuredLook.accessory)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
