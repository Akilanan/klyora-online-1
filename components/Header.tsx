
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  loyaltyPoints: number;
  onCartClick: () => void;
  onSearchClick: () => void;
  onWishlistClick: () => void;
  onArchiveClick: () => void;
  onConciergeClick: () => void;
  isSynced?: boolean;
  customerName?: string | null;
  onLoginClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  loyaltyPoints,
  onCartClick,
  onSearchClick,
  onWishlistClick,
  onArchiveClick,
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
          <button onClick={onArchiveClick} className="hover:opacity-40 transition-opacity">Archive</button>
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] font-serif italic relative z-10" aria-label="Maison Klyora Home">
            KLYORA
          </h1>
          <div className="absolute -inset-4 bg-white/0 group-hover:bg-white/10 blur-xl transition-all duration-700 rounded-full" />
        </div>

        {/* Desktop Nav - Right */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={onSearchClick}
            className="text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors"
            aria-label="Search"
          >
            Search
          </button>
          <button
            onClick={onConciergeClick}
            className="text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors"
            aria-label="Concierge AI"
          >
            Concierge
          </button>
          <button
            onClick={onWishlistClick}
            className="text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors relative"
            aria-label="View Wishlist"
          >
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-3 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black border border-black">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={onCartClick}
            className="text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors relative"
            aria-label="View Cart"
          >
            Cart ({cartCount})
          </button>
        </div>
      </div>
    </header>
  );
};
