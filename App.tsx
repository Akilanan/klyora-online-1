
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Product, CartItem, ProductVariant } from './types';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { Notification } from './components/Notification';
import { BackToTop } from './components/BackToTop';
import { StylistChat } from './components/StylistChat';
import { SearchOverlay } from './components/SearchOverlay';
import { shopifyService } from './services/shopifyService';
import { ProductCard } from './components/ProductCard';
import { LoginModal } from './components/LoginModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { Footer } from './components/Footer';
import { WinterPromoModal } from './components/WinterPromoModal';
import { InfoModal } from './components/InfoModal';
import { ReturnRequestModal } from './components/ReturnRequestModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { geminiService } from './services/geminiService';
import { CookieConsent } from './components/CookieConsent';
import { MOCK_PRODUCTS } from './constants';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2070&auto=format&fit=crop'
];

const OrderTrackingSimulation: React.FC = () => {
  const [step, setStep] = useState(0); // 0: Input, 1: Loading, 2: Result
  const [orderId, setOrderId] = useState('');

  const handleTrack = () => {
    if (!orderId) return;
    setStep(1);
    setTimeout(() => setStep(2), 1500);
  };

  if (step === 0) return (
    <div className="text-center py-8 animate-fade-in">
      <p className="mb-4 font-serif italic text-lg">Locate Your Parcel</p>
      <input
        type="text"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="ORDER # (e.g. KLY-8821)"
        className="bg-transparent border-b border-white/30 text-center w-full py-2 mb-6 outline-none uppercase tracking-widest focus:border-white transition-colors"
      />
      <button onClick={handleTrack} className="px-8 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition-colors">
        Track Status
      </button>
    </div>
  );

  if (step === 1) return (
    <div className="text-center py-12 animate-fade-in">
      <div className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] uppercase tracking-widest opacity-70">Retrieving Logistics Data...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <span className="block text-[9px] uppercase tracking-widest opacity-50 mb-1">Order Reference</span>
          <span className="font-mono text-lg">{orderId}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] uppercase tracking-widest opacity-50 mb-1">Estimated Arrival</span>
          <span className="font-serif italic text-lg">Tomorrow</span>
        </div>
      </div>

      <div className="relative py-4">
        <div className="absolute left-2 top-4 bottom-4 w-px bg-white/20"></div>
        <div className="space-y-6">
          <div className="relative pl-8 opacity-50">
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border border-white bg-black"></div>
            <p className="text-[10px] uppercase tracking-widest font-bold">Order Placed</p>
            <p className="text-[9px] opacity-70">Dec 26, 10:42 AM</p>
          </div>
          <div className="relative pl-8 opacity-50">
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border border-white bg-black"></div>
            <p className="text-[10px] uppercase tracking-widest font-bold">Dispatched from Paris</p>
            <p className="text-[9px] opacity-70">Dec 27, 09:15 AM</p>
          </div>
          <div className="relative pl-8">
            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#8ca67a] shadow-[0_0_10px_rgba(140,166,122,0.5)]"></div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#8ca67a]">In Transit</p>
            <p className="text-[9px] opacity-70">Arriving at Local Depot</p>
          </div>
        </div>
      </div>
      <button onClick={() => setStep(0)} className="w-full text-[9px] uppercase tracking-widest opacity-50 hover:opacity-100 mt-4">Check Another</button>
    </div>
  );
};

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
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

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

    // Fallback to Luxury Mock Data if store is empty (New Store Scenario)
    if (storeProducts && storeProducts.length > 0) {
      setProducts(storeProducts);
    } else {
      console.log("Using Klyora Luxury Mock Data");
      setProducts(MOCK_PRODUCTS);
    }

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
            case 'return-refund':
              content = (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif">Return & Refund Policy</h3>
                  <p>At Maison Klyora, we are committed to ensuring your satisfaction with our premium collection. If you are not entirely pleased with your purchase, we are here to help.</p>

                  <h4 className="font-bold uppercase text-xs tracking-wider mt-4">1. Return Eligibility</h4>
                  <p className="text-sm opacity-80">Items must be returned within 30 days of receipt. They must be unworn, unwashed, and in their original condition with all tags attached.</p>

                  <h4 className="font-bold uppercase text-xs tracking-wider mt-4">2. Process</h4>
                  <p className="text-sm opacity-80">To initiate a return, please contact our Concierge or use the self-service portal. Once approved, you will receive a prepaid shipping label.</p>

                  <h4 className="font-bold uppercase text-xs tracking-wider mt-4">3. Refunds</h4>
                  <p className="text-sm opacity-80">Once we receive and inspect your return, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.</p>

                  <h4 className="font-bold uppercase text-xs tracking-wider mt-4">4. Exchanges</h4>
                  <p className="text-sm opacity-80">We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email.</p>

                  <div className="pt-6 border-t border-white/20 mt-6">
                    <button
                      onClick={() => { setInfoModal(null); setIsReturnModalOpen(true); }}
                      className="w-full bg-white text-black py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
                    >
                      Start Return / Replace
                    </button>
                  </div>
                </div>
              );
              break;
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
                  <p>We offer tracked global shipping on all orders. All parcels are insured.</p>
                  <ul className="list-disc pl-5 space-y-2 opacity-80">
                    <li>Processing: 1-3 Business Days</li>
                    <li>Shipping: 7-15 Business Days</li>
                    <li>Tracking provided via email</li>
                  </ul>
                  <h3 className="text-lg font-serif mt-6">Returns</h3>
                  <p>Returns are accepted within 30 days of delivery. Items must be unworn and in original condition with tags attached.</p>
                </div>
              );
              break;
            case 'fabric-care':
              content = (
                <div className="space-y-6">
                  <h3 className="text-lg font-serif">Detailed Care Instructions</h3>
                  <div className="space-y-4 text-xs tracking-wide">
                    <div>
                      <strong className="block mb-1 text-white">Silk</strong>
                      <p>Dry clean highly recommended. Hand wash cold with pH neutral detergent if necessary. Do not ring. Dry flat in shade.</p>
                    </div>
                    <div>
                      <strong className="block mb-1 text-white">Cashmere</strong>
                      <p>Hand wash cold or professionally dry clean. Store folded in a breathable bag with cedar balls to maintain softness.</p>
                    </div>
                    <div>
                      <strong className="block mb-1 text-white">Merino Wool</strong>
                      <p>Air frequently to refresh. Hand wash in tepid water. Lay flat to dry on a towel to preserve shape.</p>
                    </div>
                    <div>
                      <strong className="block mb-1 text-white">Leather</strong>
                      <p>Professional leather clean only. Keep away from direct heat and sunlight. Condition annually.</p>
                    </div>
                  </div>
                </div>
              );
              break;
            case 'track-order':
              content = (
                <OrderTrackingSimulation />
              );
              break;
            case 'heritage':
              content = (
                <div className="space-y-6 leading-relaxed">
                  <h3 className="text-2xl font-serif italic mb-2">The Atelier</h3>
                  <p className="text-zinc-300">Born from a desire to redefine modern silhouettes, <strong className="text-white">Maison Klyora</strong> exists at the convergence of architectural precision and organic fluidity.</p>
                  <p className="text-zinc-300">Every garment is conceived in our Paris studio, where sketches are translated into reality by fifth-generation artisans. We believe in the quiet authority of luxury—where the inside of a garment is finished as impeccably as the outside.</p>
                  <p className="italic text-white border-l border-white/20 pl-4 my-4">"True luxury is not just what you see, but how it makes you feel against your skin."</p>
                </div>
              );
              break;
            case 'sustainability':
              content = (
                <div className="space-y-5">
                  <p className="font-serif italic text-lg">Conscious by Design.</p>
                  <p className="text-zinc-300">We do not believe in seasons, only in longevity.</p>
                  <ul className="space-y-4 mt-4">
                    <li className="flex gap-4">
                      <span className="text-[#8ca67a]">●</span>
                      <span><strong>Traceable Fibers:</strong> Our silks are sourced from GOTS-certified partners in Como, Italy.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-[#8ca67a]">●</span>
                      <span><strong>Zero-Waste Pattern Cutting:</strong> We utilize advanced digital modeling to minimize fabric waste during production.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-[#8ca67a]">●</span>
                      <span><strong>Plastic-Free Logistics:</strong> Your order arrives in recycled cotton garment bags and FSC-certified boxes.</span>
                    </li>
                  </ul>
                </div>
              );
              break;
            case 'legal':
              content = (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Privacy Policy</h3>
                    <p className="text-xs text-zinc-400">We respect your privacy. Your data is encrypted and used solely for fulfilling orders and improving your atelier experience. We never sell your data to third parties.</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Terms of Service</h3>
                    <p className="text-xs text-zinc-400">By using our site, you agree to our terms. All designs are intellectual property of Maison Klyora. Prices are subject to change without notice.</p>
                  </div>
                </div>
              );
              break;
            case 'careers':
              content = (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Atelier Positions</h3>
                    <div className="space-y-6">
                      <div className="border-b border-white/10 pb-4">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="font-serif italic text-lg">Senior Pattern Cutter</h4>
                          <span className="text-[9px] uppercase tracking-widest text-zinc-400">Paris, Arr. 3</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-md">Requires 7+ years experience in draping and architectural silhouette construction. Mastery of bias cutting essential.</p>
                      </div>
                      <div className="border-b border-white/10 pb-4">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="font-serif italic text-lg">Textile Archivist</h4>
                          <span className="text-[9px] uppercase tracking-widest text-zinc-400">Remote / Paris</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-md">Manage the digital and physical sourcing library. Expertise in sustainable luxury fibers required.</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <a href="mailto:careers@klyora.com" className="text-xs uppercase tracking-widest border-b border-white/30 hover:border-white pb-1 transition-colors">Apply via Folio</a>
                  </div>
                </div>
              );
              break;
            case 'press':
              content = (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <blockquote className="border-l-2 border-white/20 pl-6 py-2">
                      <p className="font-serif italic text-lg mb-4">"Maison Klyora is redefining the quiet luxury movement with silhouettes that feel like liquid architecture."</p>
                      <footer className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">— Vogue Scandinavia, Oct 2025</footer>
                    </blockquote>
                    <blockquote className="border-l-2 border-white/20 pl-6 py-2">
                      <p className="font-serif italic text-lg mb-4">"The commitment to traceability is not just a marketing note; it is the foundation of every seam."</p>
                      <footer className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">— The Gentlewoman</footer>
                    </blockquote>
                    <blockquote className="border-l-2 border-white/20 pl-6 py-2">
                      <p className="font-serif italic text-lg mb-4">"A digital boutique that feels more intimate than a physical salon."</p>
                      <footer className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">— Wallpaper*</footer>
                    </blockquote>
                  </div>
                  <div className="text-center pt-6">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500">For inquiries: press@klyora.com</span>
                  </div>
                </div>
              );
              break;
            case 'contact':
              content = (
                <div className="text-center py-6">
                  <p className="font-serif italic text-2xl mb-2">The Concierge</p>
                  <p className="text-xs text-zinc-400 mb-8 max-w-sm mx-auto">Our team is available 24/7 to assist with styling, sizing, and bespoke requests.</p>
                  <button onClick={() => { setInfoModal(null); setIsChatOpen(true); }} className="px-8 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition-colors">
                    Open Live Chat
                  </button>
                </div>
              );
              break;
            case 'track-order':
              setInfoModal(null);
              setIsTrackingModalOpen(true);
              return; // Exit early as we handlethe modal
            case 'gift-card':
              content = (
                <div className="text-center py-6">
                  <p className="mb-6 font-serif italic text-xl">The Klyora Privilege Card</p>
                  <div className="max-w-xs mx-auto bg-zinc-900 border border-white/10 p-6 mb-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="text-left mb-8">
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold block mb-1">Maison Klyora</span>
                      <span className="text-[8px] uppercase tracking-widest text-[#8ca67a]">Virtual Asset</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono opacity-50 block">0000 0000 0000 0000</span>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button className="px-6 py-3 bg-white text-black text-[9px] uppercase font-bold tracking-widest hover:bg-zinc-200 transition-colors">Purchase</button>
                    <button className="px-6 py-3 border border-white/20 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-white hover:text-black transition-all">Check Balance</button>
                  </div>
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
      <ReturnRequestModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
      {notification && <Notification message={notification.message} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default App;
