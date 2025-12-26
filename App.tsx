
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
import { Footer } from './components/Footer';
import { WinterPromoModal } from './components/WinterPromoModal';
import { InfoModal } from './components/InfoModal';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2070&auto=format&fit=crop'
];

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isStoreSynced, setIsStoreSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('klyora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('klyora_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; content: React.ReactNode } | null>(null);
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
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');

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

  /* SEO: Dynamic Title Management */
  useEffect(() => {
    if (selectedQuickView) {
      document.title = `${selectedQuickView.name} | Maison Klyora`;
    } else if (activeCategory) {
      document.title = `${activeCategory} Collection | Maison Klyora`;
    } else {
      document.title = "Maison Klyora | Curated Luxury";
    }
  }, [selectedQuickView, activeCategory]);

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

  /* Full filtering logic */
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Visual Search
      if (visualSearchIds && !visualSearchIds.includes(p.id)) return false;

      // Text Search
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Category Filter
      if (activeCategory && p.category !== activeCategory) return false;

      // Price Filter
      if (priceRange) {
        const [min, max] = priceRange;
        if (p.price < min || (max < 10000 && p.price > max)) return false;
        if (max === 10000 && p.price < 1000) return false;
      }

      // Material Filter
      if (selectedMaterial) {
        if (!p.composition?.toLowerCase().includes(selectedMaterial.toLowerCase())) return false;
      }

      // Color Filter
      if (selectedColor) {
        const hasColor = p.variants?.some(v => v.title.toLowerCase().includes(selectedColor.toLowerCase()));
        if (!hasColor && !p.description.toLowerCase().includes(selectedColor.toLowerCase())) return false;
      }

      // Availability Filter
      if (inStockOnly) {
        if (!p.variants?.some(v => v.available)) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [products, activeCategory, searchQuery, visualSearchIds, priceRange, selectedMaterial, selectedColor, inStockOnly, sortBy]);

  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(p => {
      // Extract main material from composition or mock it if empty
      // Example composition: "100% Cashmere" -> "Cashmere"
      if (p.composition) {
        const simpleMat = p.composition.replace(/[0-9%]/g, '').trim().split(' ')[0]; // Very naive extraction
        if (simpleMat) materials.add(simpleMat);
      }
    });
    // Fallback/Mock list if extraction is too messy for now to ensure UI looks populated
    return Array.from(materials).length > 0 ? Array.from(materials) : ['Silk', 'Cotton', 'Wool', 'Cashmere', 'Linen', 'Velvet'];
  }, [products]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach(p => {
      p.variants?.forEach(v => {
        const parts = v.title.split(' / ');
        parts.forEach(part => {
          if (['Black', 'White', 'Beige', 'Red', 'Blue', 'Navy', 'Green', 'Brown', 'Grey', 'Silver', 'Gold', 'Cream', 'Charcoal'].includes(part)) {
            colors.add(part);
          }
        });
      });
    });
    const defaultColors = ['Black', 'White', 'Beige', 'Navy', 'Grey'];
    defaultColors.forEach(c => colors.add(c));
    return Array.from(colors);
  }, [products]);

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
        onWishlistClick={() => setIsWishlistOpen(true)}
        onArchiveClick={() => setIsArchiveOpen(true)}
        onConciergeClick={() => setIsChatOpen(true)}
        isSynced={isStoreSynced}
        customerName={customerName}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      <main>
        {/* Editorial Hero */}
        <section className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center">
          {BACKGROUND_IMAGES.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt={`Maison Klyora Premium Fashion Campaign - Look ${idx + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[3000ms] ease-in-out"
              style={{
                opacity: idx === bgIndex ? 0.4 : 0,
                transform: `scale(${1 + smoothScrollY * 0.0001})`
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          <div className="relative z-10 text-center px-6">
            <span className="text-[9px] uppercase tracking-[1.2em] text-white/30 block mb-12 animate-fade-in-up">MAISON KLYORA</span>
            <h1 className="editorial-heading font-serif tracking-tighter mb-16 animate-fade-scale text-white/90 text-4xl md:text-6xl lg:text-7xl">
              Premium Fashion <br /> <span className="italic">Designed for Modern Style</span>
            </h1>
            <div className="flex flex-col md:flex-row justify-center items-center gap-12">
              <button
                onClick={() => setIsChatOpen(true)}
                className="group relative px-20 py-7 bg-white text-black text-[9px] font-bold uppercase tracking-[0.5em] hover:bg-zinc-200 transition-all"
              >
                AI Concierge
              </button>
              <button
                onClick={() => document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white text-[8px] uppercase tracking-[0.6em] font-bold border-b border-white/10 pb-2 hover:border-white transition-all"
              >
                Shop Collections
              </button>
            </div>
          </div>
        </section>

        {/* Trust Signals Bar */}
        <div className="bg-white border-b border-black/5 py-8">
          <div className="max-w-[1600px] mx-auto px-10 flex flex-wrap justify-center md:justify-around gap-8">
            {[
              { label: "Secure Checkout", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" },
              { label: "Fast Global Shipping", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" },
              { label: "Easy Returns", icon: "M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" },
              { label: "Premium Quality", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 text-black/80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} /></svg>
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Manifesto (SEO & Storytelling) */}
        <section className="max-w-4xl mx-auto px-10 py-32 text-center">
          <h2 className="text-[9px] uppercase tracking-[0.6em] font-bold text-[#8ca67a] mb-8">The Maison Philosophy</h2>
          <p className="font-serif text-2xl md:text-3xl italic leading-relaxed text-white/90 mb-10">
            "True luxury is found in the silence of a perfect silhouette."
          </p>
          <div className="text-zinc-500 text-xs md:text-sm leading-loose tracking-wide space-y-6 font-light max-w-2xl mx-auto">
            <p>
              Welcome to <strong className="text-zinc-600 font-normal">Maison Klyora</strong>, a digital sanctuary dedicated to the art of the
              <em className="text-zinc-400 not-italic"> premium silhouette</em>. Our atelier curators travel the virtual globe to select only
              the finest materials, ensuring that every view reveals a new detail of uncompromised luxury.
            </p>
            <p>
              We believe that style is an architectural pursuit. From the drape of a wool coat to the structure of a tailored blazer,
              every piece in our collection is chosen to enhance your personal narrative. We invite you to explore our bespoke inventory,
              where each item is more than a garment—it is a promise of enduring elegance. Experience the detail, embrace the premium,
              and define your legacy with Klyora.
            </p>
          </div>
        </section>

        {/* Boutique Grid */}
        <section id="collection-grid" className="max-w-[1600px] mx-auto px-10 py-48">
          <div className="mb-32 flex flex-col md:flex-row items-baseline justify-between border-b border-white/5 pb-16 gap-10">
            <div>
              <h2 className="text-3xl uppercase tracking-[0.6em] font-bold text-white font-serif italic">Explore Our Premium Clothing Collection</h2>
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

      <Footer
        onConciergeClick={() => setIsChatOpen(true)}
        onLinkClick={(title, type) => {
          let content;
          switch (type) {
            case 'size-guide':
              content = (
                <div className="space-y-6">
                  <p>Our sizing is tailored to fit the modern silhouette. Please refer to the chart below.</p>
                  <table className="w-full text-xs border border-white/20 text-center">
                    <thead className="bg-white/5 font-bold uppercase tracking-wider">
                      <tr><th className="p-3">Size</th><th className="p-3">US</th><th className="p-3">EU</th><th className="p-3">Bust (cm)</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr><td className="p-3">XS</td><td className="p-3">0-2</td><td className="p-3">34</td><td className="p-3">80-84</td></tr>
                      <tr><td className="p-3">S</td><td className="p-3">4-6</td><td className="p-3">36</td><td className="p-3">85-89</td></tr>
                      <tr><td className="p-3">M</td><td className="p-3">8-10</td><td className="p-3">38</td><td className="p-3">90-94</td></tr>
                      <tr><td className="p-3">L</td><td className="p-3">12-14</td><td className="p-3">40</td><td className="p-3">95-100</td></tr>
                    </tbody>
                  </table>
                </div>
              );
              break;
            case 'shipping':
              content = (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif">Global Shipping</h3>
                  <p>We offer complimentary express shipping on all orders over $500. All parcels are insured and trackable.</p>
                  <ul className="list-disc pl-5 space-y-2 opacity-80">
                    <li>Europe: 1-2 Business Days</li>
                    <li>USA/Canada: 2-3 Business Days</li>
                    <li>Asia/Pacific: 3-5 Business Days</li>
                  </ul>
                  <h3 className="text-lg font-serif mt-6">Returns</h3>
                  <p>Returns are accepted within 30 days of delivery. Items must be unworn and in original condition with tags attached.</p>
                </div>
              );
              break;
            case 'gift-card':
              content = (
                <div className="text-center py-8">
                  <p className="mb-6">Digital Gift Cards are the ultimate expression of luxury choice.</p>
                  <p>To purchase a Gift Card, please visit our Atelier in Paris or contact our Concierge for a personalized arrangement.</p>
                  <button onClick={() => { setInfoModal(null); setIsChatOpen(true); }} className="mt-8 px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors">
                    Contact Concierge
                  </button>
                </div>
              );
              break;
            case 'coming-soon':
              content = (
                <div className="text-center py-12">
                  <p className="text-lg italic font-serif">This section is currently being curated.</p>
                  <p className="mt-4 text-xs uppercase tracking-widest opacity-60">Please check back soon.</p>
                </div>
              );
              break;
            default:
              content = <p>Information unavailable.</p>;
          }
          setInfoModal({ isOpen: true, title, content });
        }}
      />

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
        results={filteredProducts}
        currency={currency}
        onVisualResults={(ids) => { setVisualSearchIds(ids); setIsSearchOpen(false); }}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        selectedMaterial={selectedMaterial}
        onMaterialChange={setSelectedMaterial}
        allMaterials={allMaterials}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        allColors={allColors}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        sortBy={sortBy}
        onSortChange={setSortBy}
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

      {infoModal && (
        <InfoModal
          isOpen={infoModal.isOpen}
          onClose={() => setInfoModal(null)}
          title={infoModal.title}
          content={infoModal.content}
        />
      )}

      <BackToTop />
      <WinterPromoModal />
      {notification && <Notification message={notification.message} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App;
