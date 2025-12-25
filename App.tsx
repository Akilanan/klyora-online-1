
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
import { ProductCard } from './components/ProductCard';
import { LoginModal } from './components/LoginModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ArchiveDrawer } from './components/ArchiveDrawer';

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
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
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
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const animateParallax = () => {
    setSmoothScrollY(prev => prev + (scrollY - prev) * 0.1);
    requestRef.current = requestAnimationFrame(animateParallax);
  };

  /* New state for currency */
  const [currency, setCurrency] = useState('$');

  useEffect(() => {
    // @ts-ignore
    if (window.KlyoraConfig) {
      // @ts-ignore
      const config = window.KlyoraConfig;
      if (config.currency) setCurrency(config.currency);

      if (config.customer) {
        // Simple logic: 1 point per dollar spent
        setLoyaltyPoints(Math.floor(config.customer.totalSpent || 0));
        setCustomerName(config.customer.name);
      } else {
        setLoyaltyPoints(0); // Guest starts at 0
        setCustomerName(null);
      }
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

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Construct Cart Permalink
    // Format: /cart/{variant_id}:{quantity},{variant_id}:{quantity}
    const items = cart.map(item => {
      // Extract numeric ID if it's a GID
      const variantId = item.selectedVariant.id.toString().split('/').pop();
      return `${variantId}:${item.quantity}`;
    }).join(',');

    // Redirect to real Shopify Checkout
    window.location.href = `/cart/${items}`;
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showNotification("Removed from Saved Looks");
        return prev.filter(id => id !== productId);
      }
      showNotification("Saved to Your Looks");
      return [...prev, productId];
    });
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
  const wishlistItems = useMemo(() => products.filter(p => wishlist.includes(p.id)), [products, wishlist]);


  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        loyaltyPoints={loyaltyPoints}
        onCartClick={() => setIsCartOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onWishlistClick={() => setIsArchiveOpen(true)}
        onSavedLooksClick={() => setIsWishlistOpen(true)}
        isSynced={isStoreSynced}
        customerName={customerName}
        onLoginClick={() => setIsLoginOpen(true)}
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
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                onClick={() => setSelectedQuickView(product)}
                isSaved={wishlist.includes(product.id)}
                onToggleSave={(e) => { e?.stopPropagation(); handleToggleWishlist(product.id); }}
              />
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
          onCheckout={handleCheckout}
          currency={currency}
        />
      )}

      {isWishlistOpen && (
        <WishlistDrawer
          items={wishlistItems}
          onClose={() => setIsWishlistOpen(false)}
          onRemove={(id) => handleToggleWishlist(id)}
          onMoveToBag={(product) => { setIsWishlistOpen(false); setSelectedQuickView(product); }}
          currency={currency}
        />
      )}

      {isArchiveOpen && (
        <ArchiveDrawer
          products={products}
          onClose={() => setIsArchiveOpen(false)}
          onSelectProduct={(product) => { setIsArchiveOpen(false); setSelectedQuickView(product); }}
          currency={currency}
        />
      )}

      {selectedQuickView && (
        <QuickViewModal
          product={selectedQuickView}
          allProducts={products}
          onClose={() => setSelectedQuickView(null)}
          onAddToCart={handleAddToCart}
          currency={currency}
          isSaved={wishlist.includes(selectedQuickView.id)}
          onToggleSave={() => handleToggleWishlist(selectedQuickView.id)}
        />
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <BackToTop />
      {notification && <Notification message={notification.message} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App;
