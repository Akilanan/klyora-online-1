// @ts-nocheck
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
import { LoyaltyDashboard } from './components/LoyaltyDashboard';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { StyleQuizModal } from './components/StyleQuizModal';
import { PressPortalModal } from './components/PressPortalModal';
import { ExitIntentModal } from './components/ExitIntentModal';
import { SocialProofToast } from './components/SocialProofToast';
import { SoundController } from './components/SoundController';
import { ArchiveLoginModal } from './components/ArchiveLoginModal';
import { CinematicPreloader } from './components/CinematicPreloader';

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

import { HeroBackground } from './components/HeroBackground';
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
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; content: React.ReactNode } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visualSearchIds, setVisualSearchIds] = useState<string[] | null>(null);

  /* REMOVED GLOBAL SCROLL STATE - Performance Fix for "Scroll Glitch"
   * The Parallax effect is now isolated in HeroBackground.tsx
   * This prevents the entire App tree from re-rendering on every pixel.
   */
  const [bgIndex, setBgIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStyleQuizOpen, setIsStyleQuizOpen] = useState(false);
  const [isPressOpen, setIsPressOpen] = useState(false);
  const [isArchiveLoginOpen, setIsArchiveLoginOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'editorial'>('grid');

  // New Filters
  const [currency, setCurrency] = useState('$');
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [language, setLanguage] = useState<'EN' | 'FR'>('EN');

  // Translations Dictionary
  const t = useMemo(() => ({
    EN: {
      bag: 'Bag',
      collection: 'Collection',
      concierge: 'Concierge',
      discover: 'Discover the Collection',
      heroTitle: 'Elegance in Motion',
      heroSubtitle: 'The New Season',
      waitlist: 'Join Waitlist',
      addToBag: 'Add to Bag'
    },
    FR: {
      bag: 'Panier',
      collection: 'Le Vestiaire',
      concierge: 'Conciergerie',
      discover: 'DÃ©couvrir la Collection',
      heroTitle: 'Ã‰lÃ©gance en Mouvement',
      heroSubtitle: 'La Nouvelle Saison',
      waitlist: 'Rejoindre la File',
      addToBag: 'Ajouter au Panier'
    }
  })[language], [language]);

  useEffect(() => {
    console.log('[App] Currency updated to:', currency);
  }, [currency]);



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
    // @ts-ignore
    if (window.KlyoraConfig) {
      // @ts-ignore
      const config = window.KlyoraConfig;
      if (config.currency) setCurrency(config.currency);

      if (config.customer) {
        setLoyaltyPoints(Math.floor(config.customer.totalSpent || 0));
        setCustomerName(config.customer.name);
      } else {
        // Fallback to LocalStorage for "Mock" practicality
        const localUser = localStorage.getItem('klyora_user');
        if (localUser) {
          const u = JSON.parse(localUser);
          setCustomerName(u.name);
          setLoyaltyPoints(u.tier === 'Gold' ? 2500 : 500);
        } else {
          setLoyaltyPoints(0);
          setCustomerName(null);
        }
      }
    } else {
      // Also check here if KlyoraConfig is totally missing (dev mode)
      const localUser = localStorage.getItem('klyora_user');
      if (localUser) {
        const u = JSON.parse(localUser);
        setCustomerName(u.name);
        setLoyaltyPoints(u.tier === 'Gold' ? 2500 : 500);
      }
    }

    syncStore();
    const bgInterval = setInterval(() => {
      setBgIndex((current) => (current + 1) % BACKGROUND_IMAGES.length);
    }, 10000);

    return () => {
      clearInterval(bgInterval);
    };
  }, []);

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

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // 1. Analytics
    if ((window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        currency: currency,
        content_ids: cart.map(i => i.id),
        num_items: cart.length
      });
    }

    // 2. Persistent Inventory Simulation
    // We update the local mock database to reflect these items being 'purchased'
    for (const item of cart) {
      // In a real app we'd await this, but for UX speed/optimistic UI we can run it
      // However, since we redirect, we should probably await a tiny bit or just fire and hope (localStorage is sync)
      // localStorage is synchronous, so this is safe!
      await import('./services/zendropService').then(({ zendropService }) => {
        zendropService.decrementStock(item.id, item.quantity);
      });
    }

    // 3. Klaviyo Tracking
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

    // 4. Redirect
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

  /* 
   * Semantic Search Logic
   * ---------------------
   * 1. If we have exact text matches, prioritize those (shallow).
   * 2. If no text matches OR we want recommendations, check AI results.
   */
  const [semanticMatches, setSemanticMatches] = useState<string[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    // Debounce Intent Analysis
    if (!searchQuery || searchQuery.length < 3) {
      setSemanticMatches(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiSearching(true);
      // "Do Deep Search" logic
      const results = await geminiService.semanticSearch(searchQuery, products);
      if (results.length > 0) {
        setSemanticMatches(results.map(p => p.id));
      } else {
        setSemanticMatches(null);
      }
      setIsAiSearching(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // 0. Visual Search Override
      if (visualSearchIds && !visualSearchIds.includes(p.id)) return false;

      // 1. Text Search (Hybrid: Precise + Semantic)
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        const preciseMatch = p.name.toLowerCase().includes(lowerQ) || p.description.toLowerCase().includes(lowerQ);

        // If we have semantic matches, allow them even if text doesn't match
        const semanticMatch = semanticMatches ? semanticMatches.includes(p.id) : false;

        if (!preciseMatch && !semanticMatch) return false;
      }

      // 2. Filters
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
  }, [products, activeCategory, searchQuery, visualSearchIds, priceRange, selectedMaterial, selectedColor, inStockOnly, sortBy, semanticMatches]);

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
      <CinematicPreloader />
      <AnnouncementBar />
      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        wishlistCount={wishlist.length}
        loyaltyPoints={loyaltyPoints}
        onPriveClick={() => setIsVipModalOpen(true)}
        onArchiveClick={() => setIsArchiveLoginOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onArchiveClick={() => setIsArchiveOpen(true)}
        onConciergeClick={() => setIsChatOpen(true)}
        isSynced={isStoreSynced}
        customerName={customerName}
        onLoginClick={() => setIsLoginOpen(true)}
        onShopClick={() => {
          setActiveCategory(null);
          setIsSearchOpen(true);
        }}
        onLoyaltyClick={() => setIsLoyaltyOpen(true)}
        t={t}
      />

      {/* Search Overlay Injection */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        selectedMaterial={selectedMaterial}
        onMaterialChange={setSelectedMaterial}
        allMaterials={allMaterials}
        resultsCount={filteredProducts.length}
        catalog={products}
        results={filteredProducts}
        currency={currency}
        onVisualResults={setVisualSearchIds}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        allColors={allColors}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        sortBy={sortBy}
        onSortChange={setSortBy}
        /* @ts-ignore - passing extra prop */
        isAiAnalyzing={isAiSearching}
      />

      <main>
        {/* Editorial Hero (Cinematic Video) */}
        <main>
          {/* Editorial Hero (Cinematic Video) - Now Isolated for Performance */}
          {/* @ts-ignore */}
          <HeroBackground
            t={t}
            onConciergeClick={() => setIsChatOpen(true)}
            onStyleQuizClick={() => setIsStyleQuizOpen(true)}
          />

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
                where each item is more than a garmentâ€”it is a promise of enduring elegance. Experience the detail, embrace the premium,
                and define your legacy with Klyora.
              </p>
            </div>
          </section>

          {/* Shop The Look Editorial */}
          <ShopTheLook
            products={products}
            currency={currency}
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


            <div className="flex justify-end mb-8 gap-4 px-2">
              <button onClick={() => setViewMode('grid')} className={`text-[9px] uppercase tracking-widest ${viewMode === 'grid' ? 'text-white border-b border-white' : 'text-zinc-500'}`}>Grid View</button>
              <button onClick={() => setViewMode('editorial')} className={`text-[9px] uppercase tracking-widest ${viewMode === 'editorial' ? 'text-white border-b border-white' : 'text-zinc-500'}`}>Editorial View</button>
            </div>

            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-40' : 'flex flex-col gap-32'} min-h-[500px]`}>
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
                filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage).map((product, idx) => (
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      onClick={() => setSelectedQuickView(product)}
                      isSaved={wishlist.includes(product.id)}
                      onToggleSave={(e) => { e?.stopPropagation(); handleToggleWishlist(product.id); }}
                    />
                  ) : (
                    // Editorial View Item
                    <div key={product.id} className={`flex flex-col md:flex-row items-center gap-16 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`} onClick={() => setSelectedQuickView(product)}>
                      <div className="flex-1 w-full aspect-[3/4.5] relative group cursor-pointer overflow-hidden">
                        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                      </div>
                      <div className="flex-1 space-y-8 text-center md:text-left">
                        <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-500">Collection No. {idx + 1}</span>
                        <h3 className="text-4xl font-serif italic">{product.name}</h3>
                        <p className="max-w-md text-zinc-400 text-sm leading-loose md:mx-0 mx-auto">{product.description || 'A timeless piece of modern luxury, designed for the contemporary silhouette.'}</p>
                        <button className="text-[9px] uppercase tracking-[0.3em] border text-white border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-colors">View Piece</button>
                      </div>
                    </div>
                  )
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

        {/* @ts-ignore */}
        <Footer
          onConciergeClick={() => setIsChatOpen(true)}
          onLinkClick={(title, type) => {
            if (type === 'press') {
              setIsPressOpen(true);
              return;
            }
            if (type === 'return-refund') {
              setIsReturnModalOpen(true);
              return;
            }
            if (type === 'track-order') {
              setIsTrackingModalOpen(true);
              return;
            }

            let content = <p>Information unavailable.</p>;
            if (type === 'coming-soon') {
              content = (
                <div className="text-center py-12">
                  <p className="text-lg italic font-serif">This section is currently being curated.</p>
                  <p className="mt-4 text-xs uppercase tracking-widest opacity-60">Please check back soon.</p>
                </div>
              );
            }

            setInfoModal({ isOpen: true, title, content });
          }}
          onSubscribe={(email) => showNotification(`Subscribed: ${email}`)}
          language={language}
          setLanguage={setLanguage}
          currency={currency}
          setCurrency={setCurrency}
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

        <ReturnRequestModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
        <OrderTrackingModal isOpen={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} />
        <VipAccessModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} onAccessGranted={() => {
          showNotification("Welcome to the Inner Circle. Exclusive access granted.");
          setActiveCategory('Atelier Exclusive');
          setLoyaltyPoints(5000); // Instant Collector Status

          // Inject Secret Product
          const secretProduct: Product = {
            id: 'secret-1',
            name: 'The Membership Jacket',
            price: 12000,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop',
            description: "The ultimate symbol of the Klyora Inner Circle. Hand-stitched in Florence. Only available to members.",
            category: 'Atelier Exclusive',
            variants: [
              { id: 's-1', title: 'Bespoke Fit / Midnight', price: 12000, available: true },
              { id: 's-2', title: 'Bespoke Fit / Onyx', price: 12000, available: true }
            ],
            images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1936&auto=format&fit=crop'],
            tags: ['exclusive', 'jacket', 'membership'],
            reviews: 0,
            rating: 5
          };
          setProducts(prev => [secretProduct, ...prev]);
        }} />
        <LoyaltyDashboard
          isOpen={isLoyaltyOpen}
          onClose={() => setIsLoyaltyOpen(false)}
          points={loyaltyPoints}
          customerName={customerName}
        />

        {/* Search Overlay with Admin Trigger */}
        {isSearchOpen && (
          <SearchOverlay
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSearch={(q) => {
              if (q.toLowerCase() === '/admin') {
                setIsSearchOpen(false);
                setIsAdminOpen(true);
              } else {
                setSearchQuery(q);
                setActiveCategory(null);
                setIsSearchOpen(false);
                document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onVisualSearch={async (file) => {
              setIsSearchOpen(false);
              const results = await geminiService.findVisualMatch(file, products);
              setVisualSearchIds(results);
              setActiveCategory(null);
              setSearchQuery('');
              document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth' });
              showNotification("Visual Search Complete. Showing similar styles.");
            }}
          />
        )}

        {/* Admin Dashboard */}
        {/* I need to add the import and state for this to work. */}
        {/* Assuming I will add state in next step. */}
        <AdminDashboardModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

        <StyleQuizModal
          isOpen={isStyleQuizOpen}
          onClose={() => setIsStyleQuizOpen(false)}
          onComplete={(persona) => {
            setIsStyleQuizOpen(false);
            showNotification(`Style Persona Verified: ${persona}. Curating collection...`);
            setTimeout(() => {
              // Mock sorting: Just reverse or shuffle to show effect
              setProducts(prev => [...prev].reverse());
              document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth' });
            }, 1500);
          }}
        />

        <PressPortalModal isOpen={isPressOpen} onClose={() => setIsPressOpen(false)} />

        <ExitIntentModal />

        <SocialProofToast />
        <SoundController />

        <ArchiveLoginModal
          isOpen={isArchiveLoginOpen}
          onClose={() => setIsArchiveLoginOpen(false)}
          onUnlock={() => {
            setIsArchiveLoginOpen(false);
            showNotification("Archive Unlocked. Welcome to the vault.");
            setActiveCategory('Archive'); // Assuming this filters properly or I need to handle it
            document.getElementById('collection-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <ConciergeChat products={filteredProducts} />
        <CookieConsent />
        <NewsletterModal />
        {notification && <Notification message={notification.message} onClose={() => setNotification(null)} />}
    </div >
  );
};

export default App;
