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
import { ShopTheLook } from './components/ShopTheLook';
import { LoginModal } from './components/LoginModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { Footer } from './components/Footer';
import { WinterPromoModal } from './components/WinterPromoModal';
import { InfoModal } from './components/InfoModal';
import { ReturnRequestModal } from './components/ReturnRequestModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderTrackingSimulation } from './components/OrderTrackingSimulation';
import { ConciergeChat } from './components/ConciergeChat';
import { VipAccessModal } from './components/VipAccessModal';
import { PressSection } from './components/PressSection';
import { AnnouncementBar } from './components/AnnouncementBar';
import { SizeRecommenderModal } from './components/SizeRecommenderModal';
import { NewsletterModal } from './components/NewsletterModal';
import { JournalSection } from './components/JournalSection';
import { InstagramFeed } from './components/InstagramFeed';
import { LEGAL_DOCS } from './components/LegalDocs';
import { geminiService } from './services/geminiService';
import { CookieConsent } from './components/CookieConsent';
import { TestimonialsSection } from './components/TestimonialsSection';
import { MOCK_PRODUCTS } from './constants';

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2070&auto=format&fit=crop'
];

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<{ id: string, title: string, handle: string }[]>([]);
  const [aiCategories, setAiCategories] = useState<Record<string, string[]> | null>(null);
  const [activeAiCategory, setActiveAiCategory] = useState<string | null>(null);
  const [productsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [isStoreSynced, setIsStoreSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('klyora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  // New Filters
  const [currency, setCurrency] = useState('$');
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const animateParallax = () => {
    setSmoothScrollY(prev => prev + (scrollY - prev) * 0.1);
    requestRef.current = requestAnimationFrame(animateParallax);
  };

  useEffect(() => {
    localStorage.setItem('klyora_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeAiCategory, searchQuery, priceRange, selectedMaterial, selectedColor, inStockOnly, sortBy]);

  // AI Categorization
  useEffect(() => {
    if (products.length > 0 && !aiCategories && !isSyncing) {
      const runAiSort = async () => {
        const cached = localStorage.getItem('klyora_ai_cats');
        if (cached) {
          setAiCategories(JSON.parse(cached));
          return;
        }
        console.log("Running AI Categorization...");
        const cats = await geminiService.categorizeProducts(products);
        if (Object.keys(cats).length > 0) {
          setAiCategories(cats);
          localStorage.setItem('klyora_ai_cats', JSON.stringify(cats));
        }
      };
      setTimeout(runAiSort, 2000);
    }
  }, [products, isSyncing]);

  // Deep Linking
  useEffect(() => {
    if (products.length > 0 && !selectedQuickView) {
      const params = new URLSearchParams(window.location.search);
      const productHandle = params.get('product');
      if (productHandle) {
        const found = products.find(p =>
          p.id === productHandle ||
          p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === productHandle.toLowerCase()
        );
        if (found) setSelectedQuickView(found);
      }
    }
  }, [products]);

  useEffect(() => {
    if (selectedQuickView) {
      const handle = selectedQuickView.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const newUrl = `${window.location.pathname}?product=${handle}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      document.title = `${selectedQuickView.name} | Maison Klyora`;

      // Klaviyo: Viewed Product
      const _learnq = (window as any)._learnq || [];
      const item = {
        Name: selectedQuickView.name,
        ProductID: selectedQuickView.id,
        ImageURL: selectedQuickView.image,
        URL: window.location.href,
        Brand: "Maison Klyora",
        Price: selectedQuickView.price,
        CompareAtPrice: selectedQuickView.price // Assuming no discount for simplicity, or add logic
      };
      _learnq.push(['track', 'Viewed Product', item]);
      _learnq.push(['trackViewedItem', {
        Title: item.Name,
        ItemId: item.ProductID,
        Categories: [selectedQuickView.category],
        ImageUrl: item.ImageURL,
        Url: item.URL,
        Metadata: {
          Brand: item.Brand,
          Price: item.Price,
          CompareAtPrice: item.CompareAtPrice
        }
      }]);
    } else {
      const newUrl = window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
      document.title = "Maison Klyora | Curated Luxury";
    }
  }, [selectedQuickView]);

  // Init & Sync
  useEffect(() => {
    // @ts-ignore
    if (window.KlyoraConfig) {
      // @ts-ignore
      const config = window.KlyoraConfig;
      if (config.currency) setCurrency(config.currency);
      if (config.customer) {
        setLoyaltyPoints(Math.floor(config.customer.totalSpent || 0));
        setCustomerName(config.customer.name);
      } else {
        setLoyaltyPoints(0);
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

  // Actions
  const syncStore = async () => {
    setIsSyncing(true);
    const [storeProducts, storeCollections] = await Promise.all([
      shopifyService.fetchLiveCatalog(),
      shopifyService.fetchCollections()
    ]);
    if (storeProducts && storeProducts.length > 0) {
      setProducts(storeProducts);
    } else {
      console.log("Klyora: Real Mode Active - No Mock Data loaded.");
    }
    if (storeCollections) {
      setCollections(storeCollections.filter(c => c.products_count > 0));
    }
    setIsStoreSynced(true);
    setIsSyncing(false);
    setIsLoading(false);
  };

  const showNotification = (message: string) => setNotification({ message });

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    if ((window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: currency
      });
    }
    // Klaviyo: Added to Cart
    const _learnq = (window as any)._learnq || [];
    _learnq.push(['track', 'Added to Cart', {
      Name: product.name,
      ProductID: product.id,
      Price: product.price,
      ImageURL: product.image,
      URL: window.location.href, // Or product specific URL if available
      Brand: "Maison Klyora",
      Quantity: 1
    }]);
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
    if ((window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        currency: currency,
        content_ids: cart.map(i => i.id),
        num_items: cart.length
      });
    }
    // Klaviyo: Initiate Checkout (Started Checkout)
    const _learnq = (window as any)._learnq || [];
    _learnq.push(['track', 'Started Checkout', {
      $event_id: Date.now() + Math.random().toString(), // Unique ID
      $value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      Items: cart.map(item => ({
        ProductID: item.id,
        Name: item.name,
        Quantity: item.quantity,
        Price: item.price,
        RowTotal: item.price * item.quantity,
        ImageURL: item.image
      }))
    }]);
    const items = cart.map(item => {
      const variantId = item.selectedVariant.id.toString().split('/').pop();
      return `${variantId}:${item.quantity}`;
    }).join(',');
    const baseUrl = import.meta.env.DEV ? (import.meta.env.VITE_SHOPIFY_SHOP_URL || 'https://klyora-2.myshopify.com') : '';
    window.location.href = `${baseUrl}/cart/${items}`;
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
    let result = products.filter(p => {
      if (visualSearchIds && !visualSearchIds.includes(p.id)) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeAiCategory && aiCategories) {
        if (!aiCategories[activeAiCategory]?.includes(p.id)) return false;
      }
      if (priceRange) {
        const [min, max] = priceRange;
        if (p.price < min || (max < 10000 && p.price > max)) return false;
        if (max === 10000 && p.price < 1000) return false;
      }
      if (selectedMaterial) {
        if (!p.composition?.toLowerCase().includes(selectedMaterial.toLowerCase())) return false;
      }
      if (selectedColor) {
        const hasColor = p.variants?.some(v => v.title.toLowerCase().includes(selectedColor.toLowerCase()));
        if (!hasColor && !p.description.toLowerCase().includes(selectedColor.toLowerCase())) return false;
      }
      if (inStockOnly) {
        if (!p.variants?.some(v => v.available)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === 'newest') result.sort((a, b) => b.id.localeCompare(a.id));

    return result;
  }, [products, activeCategory, searchQuery, visualSearchIds, priceRange, selectedMaterial, selectedColor, inStockOnly, sortBy]);

  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(p => {
      if (p.composition) {
        const simpleMat = p.composition.replace(/[0-9%]/g, '').trim().split(' ')[0];
        if (simpleMat) materials.add(simpleMat);
      }
    });
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
      <AnnouncementBar />
      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        loyaltyPoints={loyaltyPoints}
        onPriveClick={() => setIsVipModalOpen(true)}
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
              srcSet={`${img.replace('w=2070', 'w=800')} 800w, ${img} 2070w`}
              sizes="(max-width: 768px) 800px, 100vw"
              alt={`Maison Klyora Premium Fashion Campaign - Look ${idx + 1}`}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[3000ms] ease-in-out"
              loading={idx === 0 ? "eager" : "lazy"}
              decoding={idx === 0 ? "sync" : "async"}
              // @ts-ignore - React 18 type definition gap
              fetchPriority={idx === 0 ? "high" : "low"}
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
              Timeless Heritage <br /> <span className="italic">Modern Silence</span>
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

        {/* Press / As Seen In */}
        <PressSection />

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

        {/* Shop The Look Editorial */}
        <ShopTheLook
          products={products}
          onProductClick={(p) => setSelectedQuickView(p)}
        />

        {/* Boutique Grid */}
        <section id="collection-grid" className="max-w-[1600px] mx-auto px-10 py-48">
          <div className="flex items-center gap-14 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveAiCategory(null);
              }}
              className={`text-[9px] uppercase tracking-[0.5em] font-bold transition-all whitespace-nowrap ${!activeCategory && !activeAiCategory ? 'text-white border-b border-white pb-2' : 'text-zinc-600 hover:text-white'}`}
            >
              All
            </button>

            {/* AI Categories (Priority) */}
            {aiCategories && Object.keys(aiCategories).map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveAiCategory(cat); setActiveCategory(null); }}
                className={`text-[9px] uppercase tracking-[0.5em] font-bold transition-all whitespace-nowrap ${activeAiCategory === cat ? 'text-white border-b border-white pb-2' : 'text-zinc-600 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}

            {/* Standard Collections (Fallback if AI fails or user wants specific sync) */}
            {(!aiCategories) && collections.map(col => (
              <button
                key={col.id}
                onClick={async () => {
                  setActiveCategory(col.title);
                  setIsSyncing(true);
                  const colProducts = await shopifyService.fetchProductsByCollection(col.handle);
                  setProducts(colProducts);
                  setIsSyncing(false);
                }}
                className={`text-[9px] uppercase tracking-[0.5em] font-bold transition-all whitespace-nowrap ${activeCategory === col.title ? 'text-white border-b border-white pb-2' : 'text-zinc-600 hover:text-white'}`}
              >
                {col.title}
              </button>
            ))}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-40 min-h-[500px]">
            {(isLoading || isSyncing) ? (
              // Skeleton Loader (Noir Theme)
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4.5] w-full bg-zinc-100 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 skeleton-noir opacity-10"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-zinc-100 w-1/3"></div>
                    <div className="h-4 bg-zinc-100 w-3/4"></div>
                    <div className="h-3 bg-zinc-100 w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  onClick={() => setSelectedQuickView(product)}
                  isSaved={wishlist.includes(product.id)}
                  onToggleSave={(e) => { e?.stopPropagation(); handleToggleWishlist(product.id); }}
                />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {filteredProducts.length > productsPerPage && (
            <div className="mt-32 flex flex-col items-center gap-8 animate-fade-in">

              {/* Mobile "Load More" (Feed Style) */}
              <div className="md:hidden w-full px-10">
                {currentPage * productsPerPage < filteredProducts.length ? (
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="w-full bg-white text-black py-4 text-[10px] uppercase font-bold tracking-[0.2em] border border-zinc-200 hover:bg-zinc-100 transition-colors"
                  >
                    Discover More
                  </button>
                ) : (
                  <p className="text-center text-zinc-500 text-[9px] uppercase tracking-widest">You have reached the end of the collection.</p>
                )}
              </div>

              {/* Desktop Numeric Pagination */}
              <div className="hidden md:flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 border border-white/10 text-[9px] uppercase tracking-widest disabled:opacity-30 hover:bg-white hover:text-black transition-all"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center text-[10px] border transition-all ${currentPage === i + 1 ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProducts.length / productsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                  className="px-6 py-3 border border-white/10 text-[9px] uppercase tracking-widest disabled:opacity-30 hover:bg-white hover:text-black transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        <TestimonialsSection />
        <InstagramFeed />
        <JournalSection />
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
                <div className="space-y-12">
                  <div className="relative h-64 w-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop"
                      alt="Klyora Atelier Paris"
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 hover:opacity-100 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <h3 className="text-4xl font-serif italic text-white tracking-widest">The Atelier</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 leading-relaxed">
                      <p className="text-zinc-300"><strong className="text-white">Maison Klyora</strong> was born from a singular obsession: the architecture of the silhouette.</p>
                      <p className="text-zinc-300">Located in the historic 3rd arrondissement of Paris, our digital-first studio bridges the gap between old-world craftsmanship and modern fluidity. We do not mass produce; we curate. Every collection is a dialogue between the fabric's natural drape and the wearer's movement.</p>
                    </div>
                    <div className="border-l border-white/20 pl-8 space-y-6">
                      <p className="font-serif italic text-xl text-white">"True luxury is found in the silence of a perfect fit."</p>
                      <div className="pt-4">
                        <p className="text-[10px] uppercase tracking-widest text-[#8ca67a] font-bold mb-1">Creative Director</p>
                        <p className="font-handwriting text-2xl text-white/60 rotate-[-5deg]">Elianne K.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold text-center mb-8">Our Commitments</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4 hover:bg-white/5 transition-colors">
                          <svg className="w-5 h-5 text-[#8ca67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest">Global Sourcing</p>
                      </div>
                      <div>
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4 hover:bg-white/5 transition-colors">
                          <svg className="w-5 h-5 text-[#8ca67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" /></svg>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest">Slow Fashion</p>
                      </div>
                      <div>
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4 hover:bg-white/5 transition-colors">
                          <svg className="w-5 h-5 text-[#8ca67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" /></svg>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest">Quality Assured</p>
                      </div>
                    </div>
                  </div>
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
            case 'legal-privacy':
              content = (
                <div dangerouslySetInnerHTML={{ __html: LEGAL_DOCS.privacy.content }} />
              );
              break;
            case 'legal-terms':
              content = (
                <div dangerouslySetInnerHTML={{ __html: LEGAL_DOCS.terms.content }} />
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

      {
        isCartOpen && (
          <CartDrawer
            items={cart}
            onClose={() => setIsCartOpen(false)}
            onRemove={(id, vId) => setCart(prev => prev.filter(i => !(i.id === id && i.selectedVariant.id === vId)))}
            onCheckout={handleCheckout}
            currency={currency}
          />
        )
      }

      {
        isWishlistOpen && (
          <WishlistDrawer
            items={wishlistItems}
            onClose={() => setIsWishlistOpen(false)}
            onRemove={(id) => handleToggleWishlist(id)}
            onMoveToBag={(product) => { setIsWishlistOpen(false); setSelectedQuickView(product); }}
            currency={currency}
          />
        )
      }

      {
        isArchiveOpen && (
          <ArchiveDrawer
            products={products}
            onClose={() => setIsArchiveOpen(false)}
            onSelectProduct={(product) => { setIsArchiveOpen(false); setSelectedQuickView(product); }}
            currency={currency}
          />
        )
      }

      {
        selectedQuickView && (
          <QuickViewModal
            product={selectedQuickView}
            allProducts={products}
            onClose={() => setSelectedQuickView(null)}
            onAddToCart={handleAddToCart}
            currency={currency}
            isSaved={wishlist.includes(selectedQuickView.id)}
            onToggleSave={() => handleToggleWishlist(selectedQuickView.id)}
          />
        )
      }

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {
        infoModal && (
          <InfoModal
            isOpen={infoModal.isOpen}
            onClose={() => setInfoModal(null)}
            title={infoModal.title}
            content={infoModal.content}
          />
        )
      }

      <BackToTop />
      <WinterPromoModal />
      <ReturnRequestModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
      <OrderTrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} />
      <VipAccessModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} onAccessGranted={() => {
        showNotification("Welcome to the Inner Circle. Exclusive access granted.");
        setActiveCategory('Atelier Exclusive');
      }} />
      <ConciergeChat products={filteredProducts} />
      <CookieConsent />
      <NewsletterModal />
      {notification && <Notification message={notification.message} onClose={() => setNotification(null)} />}
    </div >
  );
};

export default App;
