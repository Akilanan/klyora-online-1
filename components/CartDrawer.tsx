
import React from 'react';
import { CartItem } from '../types';
import { BoutiqueImage } from './BoutiqueImage';

interface CartDrawerProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: string, variantId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ items, onClose, onRemove, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-[400] flex justify-end">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-right">
        <div className="p-8 flex items-center justify-between border-b border-black/5">
          <h2 className="text-[10px] uppercase tracking-[0.5em] font-bold">Shopping Bag</h2>
          <button onClick={onClose} className="text-[10px] uppercase font-bold tracking-widest hover:opacity-50">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Your bag is currently empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.selectedVariant.id}`} className="flex gap-6 animate-fade-in">
                <div className="w-24 shrink-0">
                  <BoutiqueImage 
                    src={item.image} 
                    alt={item.name} 
                    aspectRatio="aspect-[3/4]"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest mb-1 leading-tight">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[8px] bg-zinc-100 px-2 py-0.5 font-bold uppercase tracking-widest">Size {item.selectedVariant.title}</span>
                       <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline mt-4">
                    <p className="text-[11px] font-bold">${item.price} USD</p>
                    <button onClick={() => onRemove(item.id, item.selectedVariant.id)} className="text-[9px] uppercase tracking-widest border-b border-black/20 hover:border-black transition-colors">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 bg-white border-t border-black/5">
            <div className="flex justify-between mb-8 text-[11px] uppercase tracking-[0.3em] font-bold">
              <span>Total Boutique Value</span>
              <span>${subtotal} USD</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.5em] hover:opacity-80 transition-all shadow-xl"
            >
              Secure Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
