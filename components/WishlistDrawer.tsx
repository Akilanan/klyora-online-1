
import React from 'react';
import { Product } from '../types';
import { BoutiqueImage } from './BoutiqueImage';

interface WishlistDrawerProps {
    items: Product[];
    onClose: () => void;
    onRemove: (productId: string) => void;
    onMoveToBag: (product: Product) => void;
    currency: string;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
    items,
    onClose,
    onRemove,
    onMoveToBag,
    currency
}) => {
    return (
        <div className="fixed inset-0 z-[400] flex justify-end font-sans">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-[500px] bg-white h-full flex flex-col shadow-2xl animate-slide-left">

                {/* Header */}
                <div className="px-10 py-8 border-b border-black/5 bg-white z-10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-serif italic text-black">Saved Looks</h2>
                        <span className="text-xs font-sans text-zinc-400 font-medium translate-y-1">{items.length}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-zinc-400 hover:text-black hover:rotate-90 transition-all duration-500"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                            <span className="text-6xl font-serif italic text-zinc-200">Empty</span>
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.2em] text-zinc-900 font-bold">Your curation is empty</p>
                                <p className="text-sm font-light text-zinc-500">Save pieces you love to track availability.</p>
                            </div>
                            <button onClick={onClose} className="text-xs border-b border-black pb-1 hover:text-zinc-600 transition-colors">Discover Collection</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-6 group">
                                {/* Product Image */}
                                <div className="w-32 shrink-0 aspect-[3/4] bg-zinc-50 overflow-hidden cursor-pointer shadow-sm relative" onClick={() => onMoveToBag(item)}>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                                    <BoutiqueImage
                                        src={item.image}
                                        alt={item.name}
                                        aspectRatio="aspect-[3/4] h-full w-full"
                                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] leading-relaxed text-black max-w-[160px] cursor-pointer hover:underline underline-offset-4" onClick={() => onMoveToBag(item)}>
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() => onRemove(item.id)}
                                                className="text-zinc-300 hover:text-red-500 transition-colors -mt-1 -mr-2 p-2 hover:bg-zinc-50 rounded-full"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-xl font-serif italic text-zinc-600">{currency}{item.price.toLocaleString()}</p>
                                    </div>

                                    <button
                                        onClick={() => onMoveToBag(item)}
                                        className="text-[10px] uppercase tracking-[0.3em] font-bold text-white bg-black py-4 px-4 hover:bg-zinc-800 transition-all w-full flex justify-between items-center group/btn"
                                    >
                                        <span>Add to Bag</span>
                                        <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">→</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
