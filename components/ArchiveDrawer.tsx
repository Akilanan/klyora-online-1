
import React, { useMemo } from 'react';
import { Product } from '../types';
import { BoutiqueImage } from './BoutiqueImage';

interface ArchiveDrawerProps {
    products: Product[];
    onClose: () => void;
    onSelectProduct: (product: Product) => void;
    currency: string;
}

export const ArchiveDrawer: React.FC<ArchiveDrawerProps> = ({
    products,
    onClose,
    onSelectProduct,
    currency
}) => {

    // Group products by category
    const groupedProducts = useMemo(() => {
        const groups: Record<string, Product[]> = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [products]);

    return (
        <div className="fixed inset-0 z-[400] flex justify-start font-sans">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-[600px] bg-zinc-900 text-white h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-right">

                {/* Header */}
                <div className="px-10 py-8 border-b border-white/10 z-10 flex items-center justify-between bg-zinc-900">
                    <div>
                        <h2 className="text-2xl font-serif italic font-bold text-white">The Archive</h2>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-2">Complete Design History</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 min-h-0 custom-scrollbar">
                    {Object.entries(groupedProducts).length === 0 ? (
                        <div className="text-center text-zinc-500 py-20">Archive Empty</div>
                    ) : (
                        Object.entries(groupedProducts).map(([category, items]: [string, Product[]]) => (
                            <div key={category} className="space-y-6">
                                <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#8ca67a] border-b border-white/5 pb-2 sticky top-0 bg-zinc-900/95 backdrop-blur py-2 z-10">
                                    {category} Collection
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {items.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => onSelectProduct(item)}
                                            className="group flex gap-5 items-center cursor-pointer p-2 -mx-2 rounded hover:bg-white/5 transition-colors"
                                        >
                                            <div className="w-12 aspect-[3/4] bg-zinc-800 overflow-hidden relative opacity-70 group-hover:opacity-100 transition-opacity">
                                                <BoutiqueImage
                                                    src={item.image}
                                                    alt={item.name}
                                                    aspectRatio="aspect-[3/4] h-full w-full"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-serif italic text-white/80 group-hover:text-white transition-colors">{item.name}</h4>
                                                <p className="text-[9px] uppercase tracking-wider text-zinc-600 group-hover:text-zinc-500">{item.composition || 'Available Now'}</p>
                                            </div>
                                            <span className="text-xs font-light text-zinc-500 group-hover:text-white transition-colors">{currency}{item.price}</span>
                                            <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/10 text-center">
                    <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-600">Maison Klyora &copy; 2024</p>
                </div>

            </div>
        </div>
    );
};
