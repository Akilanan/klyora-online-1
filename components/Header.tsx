
import React, { useState, useEffect } from 'react';
import { useUi } from '../contexts/UiContext';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  wishlistCount: number;
  loyaltyPoints: number;
  // onCartClick removed
  // onSearchClick removed
  // onWishlistClick removed (will use Context)
  onArchiveClick: () => void; // Could be context?
  onConciergeClick: () => void;
  isSynced?: boolean;
  customerName?: string | null;
  onLoginClick?: () => void;
  onPriveClick?: () => void;
  onShopClick: () => void;
  onLoyaltyClick: () => void;
  t?: {
    bag: string;
    collection: string;
    concierge: string;
    discover: string;
    heroTitle: string;
    heroSubtitle: string;
    waitlist: string;
    addToBag: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  // cartCount removed
  wishlistCount,
  loyaltyPoints,
  // onCartClick removed
  // onSearchClick removed
  // onWishlistClick removed
  onArchiveClick,
  isSynced,
  customerName,
  onLoginClick,
  onConciergeClick,
  onPriveClick,
  onShopClick,
  onLoyaltyClick,
  t
}) => {
  const {
    setIsSearchOpen,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsMenuOpen: setGlobalMenuOpen // Assuming context has this
  } = useUi();
  const { itemCount: cartCount } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <button onClick={onShopClick} className="hover:opacity-40 transition-opacity">{t?.collection || 'Collection'}</button>
          <button onClick={onPriveClick} className="hover:opacity-40 transition-opacity text-[#8ca67a]">Privé</button>
          <button onClick={onArchiveClick} className="hover:opacity-40 transition-opacity">Archive</button>
          {customerName ? (
            <button onClick={onLoyaltyClick} className="hover:opacity-40 transition-opacity">Account</button>
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
            onClick={() => setIsSearchOpen(true)}
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
            {t?.concierge || 'Concierge'}
          </button>
          <button
            onClick={() => setIsWishlistOpen(true)}
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
            onClick={() => setIsCartOpen(true)}
            className="text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors relative"
            aria-label="View Cart"
          >
            {t?.bag || 'Bag'} ({cartCount})
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-white z-[60] transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden flex flex-col pt-32 px-10`}>
        <button
          className="absolute top-10 right-10 text-xs uppercase tracking-widest font-bold"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Close
        </button>

        <nav className="flex flex-col gap-12">
          <button
            onClick={() => { setIsMobileMenuOpen(false); onShopClick(); }}
            className="text-4xl font-serif italic text-black text-left"
          >
            Collection
          </button>
          <button
            onClick={() => { setIsMobileMenuOpen(false); onConciergeClick(); }}
            className="text-4xl font-serif italic text-black text-left"
          >
            Concierge
          </button>
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsWishlistOpen(true); }}
            className="text-4xl font-serif italic text-black text-left"
          >
            Saved Looks ({wishlistCount})
          </button>
          <button
            onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}
            className="text-4xl font-serif italic text-black text-left"
          >
            Cart ({cartCount})
          </button>
          <button
            onClick={() => { setIsMobileMenuOpen(false); onPriveClick?.(); }}
            className="text-4xl font-serif italic text-[#8ca67a] text-left"
          >
            Privé
          </button>
          <button
            onClick={() => { setIsMobileMenuOpen(false); onArchiveClick(); }}
            className="text-4xl font-serif italic text-black text-left"
          >
            Archive
          </button>
          {customerName ? (
            <button onClick={() => { setIsMobileMenuOpen(false); onLoyaltyClick(); }} className="text-sm uppercase tracking-widest mt-10 text-left">Account</button>
          ) : (
            <button
              onClick={() => { setIsMobileMenuOpen(false); onLoginClick?.(); }}
              className="text-sm uppercase tracking-widest mt-10 text-left"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
