import React, { useMemo } from 'react';
import { CartItem } from '../types';
import { BoutiqueImage } from './BoutiqueImage';

interface CartDrawerProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: string, variantId: string) => void;
  onCheckout: () => void;
  currency: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ items, onClose, onRemove, onCheckout, currency }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const FREE_SHIPPING_THRESHOLD = 500;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="fixed inset-0 z-[400] flex justify-end font-sans">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-[500px] bg-white h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)] animate-slide-left">

        {/* Header */}
        <div className="px-8 py-6 border-b border-black/5 bg-white z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif italic font-bold text-black">Shopping Bag <span className="text-sm font-sans not-italic text-zinc-400 font-normal">({items.length})</span></h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Shipping Progress */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest font-bold text-center text-zinc-600">
              {remaining > 0 ? (
                <>Spend <span>{currency}{remaining}</span> more for <span className="text-black">Complimentary Shipping</span></>
              ) : (
                <span className="text-[#8ca67a]">You have unlocked Complimentary Shipping</span>
              )}
            </p>
            <div className="h-[2px] w-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-4xl"></span>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">Your bag is currently empty</p>
              <button onClick={onClose} className="text-xs underline underline-offset-4 hover:text-zinc-500 transition-colors">Continue Shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.selectedVariant.id}`} className="flex gap-6 group">
                {/* Product Image */}
                <div className="w-28 shrink-0 relative aspect-[3/4] bg-zinc-50 overflow-hidden">
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
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xs uppercase font-bold tracking-widest leading-relaxed text-black max-w-[180px]">
                        {item.name}
                      </h3>
                      <p className="text-sm font-serif italic text-black">{currency}{item.price}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                        Size: <span className="text-black">{item.selectedVariant.title}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemove(item.id, item.selectedVariant.id)}
                    className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-red-500 text-left transition-colors w-fit border-b border-transparent hover:border-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 bg-zinc-50 border-t border-black/5 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Subtotal</span>
                <span className="text-lg font-serif italic font-bold">{currency}{subtotal.toLocaleString()}</span>
              </div>
              <p className="text-[9px] text-zinc-400 text-center">Shipping, taxes, and duty calculated at checkout.</p>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all active:scale-[0.99]"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
