
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

            <div className="relative w-full max-w-[450px] bg-white h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)] animate-slide-left">

                {/* Header */}
                <div className="px-8 py-6 border-b border-black/5 bg-white z-10 flex items-center justify-between">
                    <h2 className="text-xl font-serif italic font-bold text-black">Saved Looks <span className="text-sm font-sans not-italic text-zinc-400 font-normal">({items.length})</span></h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <svg className="w-10 h-10 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">Your curaion is empty</p>
                            <button onClick={onClose} className="text-xs underline underline-offset-4 hover:text-zinc-500 transition-colors">Discover Pieces</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-6 group">
                                {/* Product Image */}
                                <div className="w-24 shrink-0 relative aspect-[3/4] bg-zinc-50 overflow-hidden cursor-pointer" onClick={() => onMoveToBag(item)}>
                                    <BoutiqueImage
                                        src={item.image}
                                        alt={item.name}
                                        aspectRatio="aspect-[3/4] h-full w-full"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xs uppercase font-bold tracking-widest leading-relaxed text-black max-w-[150px] cursor-pointer hover:underline" onClick={() => onMoveToBag(item)}>
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() => onRemove(item.id)}
                                                className="text-zinc-300 hover:text-red-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                            </button>
                                        </div>
                                        <p className="text-sm font-serif italic text-black">{currency}{item.price}</p>
                                    </div>

                                    <button
                                        onClick={() => onMoveToBag(item)}
                                        className="text-[9px] uppercase tracking-widest text-white bg-black py-2 px-4 hover:bg-zinc-800 transition-all text-center w-full"
                                    >
                                        View / Add to Bag
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
