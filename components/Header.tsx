
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  loyaltyPoints: number;
  onCartClick: () => void;
  onSearchClick: () => void;
  onWishlistClick: () => void;
  onConciergeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  loyaltyPoints,
  onCartClick,
  onSearchClick,
  onWishlistClick,
  onSavedLooksClick,
  isSynced,
  customerName,
  onLoginClick,
  onConciergeClick
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loyaltyTier = loyaltyPoints > 5000 ? 'Platinum' : loyaltyPoints > 2000 ? 'Gold' : loyaltyPoints > 0 ? 'Silver' : 'Guest';

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 ${scrolled ? 'bg-black/95 backdrop-blur-2xl border-b border-white/5 py-5 px-10 shadow-2xl' : 'bg-transparent py-10 px-12'}`}>
      <div className="flex items-center justify-between text-white">
        <nav className="hidden md:flex gap-14 text-[9px] uppercase tracking-[0.6em] font-bold">
          <button onClick={onWishlistClick} className="hover:opacity-40 transition-opacity">Archive</button>
          <button onClick={onSavedLooksClick} className="hover:opacity-40 transition-opacity">Saved Looks</button>
          <button onClick={onConciergeClick} className="hover:opacity-40 transition-opacity flex items-center gap-3">
            Concierge
            <div className={`w-1 h-1 rounded-full ${isSynced ? 'bg-[#8ca67a]' : 'bg-zinc-700'}`}></div>
          </button>
          {customerName ? (
            <a href="/account" className="hover:opacity-40 transition-opacity">Account</a>
          ) : (
            <button onClick={onLoginClick} className="hover:opacity-40 transition-opacity">Login</button>
          )}
        </nav>

        <h1
          className="font-serif text-3xl md:text-5xl tracking-[0.2em] cursor-pointer absolute left-1/2 -translate-x-1/2 transition-all hover:scale-105 active:scale-95 text-white font-light"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          KLYORA
        </h1>

        <div className="flex items-center gap-10">
          <div className="hidden lg:flex flex-col items-end mr-6 group cursor-help">
            <div className="flex items-center gap-2">
              <span className="text-[7px] uppercase tracking-[0.4em] font-bold text-zinc-500">Tier Status</span>
              <span className="text-[8px] font-bold text-white group-hover:text-[#8ca67a] transition-colors">{loyaltyTier}</span>
            </div>
          </div>
          <div className="flex gap-8">
            <button onClick={onSearchClick} className="text-[9px] uppercase tracking-[0.4em] font-bold hover:opacity-40 transition-opacity">Discovery</button>
            <button onClick={onCartClick} className="text-[9px] uppercase tracking-[0.4em] font-bold hover:opacity-40 flex items-center gap-3 transition-opacity">
              Bag
              <div className="flex items-center justify-center">
                <div className={`w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[7px] transition-all ${cartCount > 0 ? 'bg-white text-black border-white scale-110' : 'text-zinc-500'}`}>
                  {cartCount}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
