
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Product, CartItem, ProductVariant } from './types';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { Notification } from './components/Notification';
import { BackToTop } from './components/BackToTop';
import { StylistChat } from './components/StylistChat';
import { SearchOverlay } from './components/SearchOverlay';
import { CheckoutFlow } from './components/CheckoutFlow';
import { shopifyService } from './services/shopifyService';
import { BoutiqueImage } from './components/BoutiqueImage';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539109132314-34a9c668e007?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2070&auto=format&fit=crop'
];

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isStoreSynced, setIsStoreSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visualSearchIds, setVisualSearchIds] = useState<string[] | null>(null);

  const [scrollY, setScrollY] = useState(0);
  const [smoothScrollY, setSmoothScrollY] = useState(0);
  const lastScrollY = useRef(0);
  const requestRef = useRef<number>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const animateParallax = () => {
    setSmoothScrollY(prev => prev + (scrollY - prev) * 0.1);
    requestRef.current = requestAnimationFrame(animateParallax);
  };

  /* New state for currency */
  const [currency, setCurrency] = useState('$');

  useEffect(() => {
    // @ts-ignore
    if (window.KlyoraConfig && window.KlyoraConfig.currency) {
      // @ts-ignore
      setCurrency(window.KlyoraConfig.currency);
    }

    syncStore();
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    requestRef.current = requestAnimationFrame(animateParallax);

    const bgInterval = setInterval(() => {
      setBgIndex((current) => (current + 1) % BACKGROUND_IMAGES.length);
    }, 10000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearInterval(bgInterval);
    };
  }, [scrollY]);

  const syncStore = async () => {
    setIsSyncing(true);
    const storeProducts = await shopifyService.fetchLiveCatalog();
    setProducts(storeProducts);
    setIsStoreSynced(true);
    setIsSyncing(false);
  };

  const showNotification = (message: string) => setNotification({ message });

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id && i.selectedVariant.id === variant.id);
      if (existing) {
        return prev.map(i => (i.id === product.id && i.selectedVariant.id === variant.id) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1, selectedVariant: variant }];
    });
    setLoyaltyPoints(p => p + 50);
    showNotification(`${product.name} Added to Bag.`);
  };

  const handleCheckoutOpen = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (visualSearchIds && !visualSearchIds.includes(p.id)) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [products, activeCategory, searchQuery, visualSearchIds]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (isCheckoutOpen) {
    return (
      <CheckoutFlow
        total={cartTotal}
        onBack={() => setIsCheckoutOpen(false)}
        onComplete={() => { setIsCheckoutOpen(false); setCart([]); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        loyaltyPoints={loyaltyPoints}
        onCartClick={() => setIsCartOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onWishlistClick={() => { }}
        onSavedLooksClick={() => setIsChatOpen(true)}
        isSynced={isStoreSynced}
      />

      <main>
        {/* Editorial Hero */}
        <section className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center">
          {BACKGROUND_IMAGES.map((img, idx) => (
            <div
              key={img}
              className="absolute inset-0 transition-opacity duration-[3000ms] ease-in-out"
              style={{
                opacity: idx === bgIndex ? 0.4 : 0,
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${1 + smoothScrollY * 0.0001})`
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          <div className="relative z-10 text-center px-6">
            <span className="text-[9px] uppercase tracking-[1.2em] text-white/30 block mb-12 animate-fade-in-up">MAISON KLYORA</span>
            <h1 className="editorial-heading font-serif tracking-tighter mb-16 animate-fade-scale text-white/90">Curated <br /> <span className="italic">Luxury</span></h1>
            <div className="flex flex-col md:flex-row justify-center items-center gap-12">
              <button
                onClick={() => setIsChatOpen(true)}
                className="group relative px-20 py-7 bg-white text-black text-[9px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-200 transition-all"
              >
                AI Concierge
              </button>
              <button
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="text-white text-[8px] uppercase tracking-[0.6em] font-bold border-b border-white/10 pb-2 hover:border-white transition-all"
              >
                Explore Collection
              </button>
            </div>
          </div>
        </section>

        {/* Boutique Grid */}
        <section className="max-w-[1600px] mx-auto px-10 py-48">
          <div className="mb-32 flex flex-col md:flex-row items-baseline justify-between border-b border-white/5 pb-16 gap-10">
            <div>
              <h2 className="text-3xl uppercase tracking-[0.6em] font-bold text-white font-serif italic">Bespoke Inventory</h2>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-6">Hand-selected for the Klyora silhouette</p>
            </div>
            <div className="flex items-center gap-14">
              {['Women', 'Men', 'Atelier Exclusive'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat.includes('Exclusive') ? 'Exclusive' : cat)}
                  className={`text-[9px] uppercase tracking-[0.5em] font-bold transition-all ${activeCategory === (cat.includes('Exclusive') ? 'Exclusive' : cat) ? 'text-white border-b border-white pb-2' : 'text-zinc-600 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-40">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer animate-fade-scale"
                onClick={() => setSelectedQuickView(product)}
              >
                <div className="relative mb-12 overflow-hidden bg-zinc-900 aspect-[3/4]">
                  <BoutiqueImage
                    src={product.image}
                    alt={product.name}
                    className="group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] uppercase tracking-[0.5em] font-bold border border-white/20 px-10 py-4">View Detail</span>
                  </div>
                </div>
                <div className="flex justify-between items-start px-2">
                  <div className="flex-1">
                    <h3 className="text-[13px] uppercase font-bold tracking-[0.3em] text-white/90">{product.name}</h3>
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mt-3">{product.composition || 'Premium Silhouette'}</p>
                  </div>
                  <span className="text-[15px] font-bold font-serif italic">{currency}{product.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <StylistChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        resultsCount={filteredProducts.length}
        catalog={products}
        onVisualResults={(ids) => { setVisualSearchIds(ids); setIsSearchOpen(false); }}
        priceRange={null}
        onPriceRangeChange={() => { }}
        selectedMaterial={null}
        onMaterialChange={() => { }}
        allMaterials={[]}
      />

      {isCartOpen && (
        <CartDrawer
          items={cart}
          onClose={() => setIsCartOpen(false)}
          onRemove={(id, vId) => setCart(prev => prev.filter(i => !(i.id === id && i.selectedVariant.id === vId)))}
          onCheckout={handleCheckoutOpen}
        />
      )}

      {selectedQuickView && (
        <QuickViewModal
          product={selectedQuickView}
          onClose={() => setSelectedQuickView(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <BackToTop />
      {notification && <Notification message={notification.message} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App;
