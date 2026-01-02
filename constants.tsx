
import { Product } from './types';

export const COLORS = {
  BRAND_OLIVE: '#8ca67a',
  BRAND_DARK: '#000000',
  BRAND_LIGHT: '#ffffff',
};

export const EXCHANGE_RATES: Record<string, number> = {
  'United States': 0.012, // 1 INR = ~0.012 USD
  'United Kingdom': 0.0095,
  'Canada': 0.016,
  'Australia': 0.018,
  'France': 0.011,
  'Germany': 0.011,
  'Italy': 0.011,
  'Spain': 0.011,
  'India': 1,       // BASE CURRENCY
  'United Arab Emirates': 0.044,
  'Japan': 1.78,
  'Singapore': 0.016
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  'United States': '$',
  'United Kingdom': '£',
  'Canada': 'CA$',
  'Australia': 'AU$',
  'France': '€',
  'Germany': '€',
  'Italy': '€',
  'Spain': '€',
  'India': '₹',
  'United Arab Emirates': 'AED ',
  'Japan': '¥',
  'Singapore': 'S$'
};

export const MOCK_PRODUCTS: Product[] = [
  // --- BLAZERS & OUTERWEAR ---
  {
    id: 'om1',
    shopifyId: 'gid://shopify/Product/om1',
    handle: 'heritage-linen-blazer-beige',
    name: 'The Heritage Linen Blazer',
    price: 89,
    description: 'A structurally relaxed blazer crafted from breathable linen blend. The definition of timeless elegance, perfect for the Riviera summer or city layering.',
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop', // Beige tones
    relatedIds: ['om3', 'om4', 'om6'],
    composition: 'Premium Linen Blend',
    origin: 'Imported',
    shippingTier: 'Priority (5-8 Days)',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'],
    descriptionHtml: '<p>A structurally relaxed blazer...</p>',
    rating: 0, reviews: 0, lowStock: false
  },
  {
    id: 'om2',
    shopifyId: 'gid://shopify/Product/om2',
    handle: 'classic-wool-coat-camel',
    name: 'The Estate Wool Coat',
    price: 120, // Higher ticket item
    description: 'An investment piece featuring a notched lapel and waist-cinching belt. The camel hue speaks to understated luxury.',
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop', // Camel Coat
    relatedIds: ['om1', 'om7'],
    composition: 'Wool Blend',
    origin: 'Imported',
    shippingTier: 'Priority (5-8 Days)',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop'],
    descriptionHtml: '<p>An investment piece...</p>',
    rating: 0, reviews: 0, lowStock: true
  },

  // --- TOPS & KNITS ---
  {
    id: 'om3',
    shopifyId: 'gid://shopify/Product/om3',
    handle: 'riviera-polo-navy',
    name: 'The Riviera Polo',
    price: 55,
    description: 'A slim-fit knitted polo in deep midnight navy. Features a buttonless open placket for a refined, retro-sport aesthetic.',
    category: 'Men',
    image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?q=80&w=1000', // Polo/Shirt vibe
    relatedIds: ['om4', 'om6'],
    composition: 'Cotton Silk Blend',
    origin: 'Imported',
    shippingTier: 'Standard (7-12 Days)',
    images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?q=80&w=1000'],
    descriptionHtml: '<p>A slim-fit knitted polo...</p>',
    rating: 0, reviews: 0, lowStock: false
  },
  {
    id: 'om4',
    shopifyId: 'gid://shopify/Product/om4',
    handle: 'classic-cable-knit-cream',
    name: 'The Cable Knit Pullover',
    price: 65,
    description: 'Heritage cable stitching meets soft-touch cotton blend. The essential "Old Money" layering piece for cool evenings.',
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000', // Cable knit
    relatedIds: ['om1', 'om8'],
    composition: 'Soft Cotton Blend',
    origin: 'Imported',
    shippingTier: 'Priority (5-8 Days)',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000'],
    descriptionHtml: '<p>Heritage cable stitching...</p>',
    rating: 0, reviews: 0, lowStock: false
  },
  {
    id: 'om5',
    shopifyId: 'gid://shopify/Product/om5',
    handle: 'oxford-button-down-blue',
    name: 'The Royal Oxford',
    price: 58,
    description: 'Crisp, structured, and effortlessly polished. The definitive blue button-down for the modern gentleman.',
    category: 'Men',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000', // Shirt
    relatedIds: ['om3', 'om9'],
    composition: '100% Cotton',
    origin: 'Imported',
    shippingTier: 'Standard (7-12 Days)',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000'],
    descriptionHtml: '<p>Crisp, structured...</p>',
    rating: 0, reviews: 0, lowStock: false
  },

  // --- BOTTOMS ---
  {
    id: 'om6',
    shopifyId: 'gid://shopify/Product/om6',
    handle: 'sculpted-trouser-white',
    name: 'The Sculpted Trouser',
    price: 75,
    description: 'High-waisted, wide-leg trousers that elongate the silhouette. Tailored front pleats add architectural depth.',
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000', // White trousers
    relatedIds: ['om1', 'om4'],
    composition: 'Viscose Blend',
    origin: 'Imported',
    shippingTier: 'Priority (5-8 Days)',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000'],
    descriptionHtml: '<p>High-waisted, wide-leg...</p>',
    rating: 0, reviews: 0, lowStock: false
  },
  {
    id: 'om7',
    shopifyId: 'gid://shopify/Product/om7',
    handle: 'pleated-tennis-skirt',
    name: 'The Club Pleated Skirt',
    price: 52,
    description: 'Inspired by the courts of Wimbledon. A sharp, pleated mini skirt that pairs perfectly with our Cable Knit.',
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1577900232427-18219b9115a3?q=80&w=1000', // Tennis vibe
    relatedIds: ['om4', 'om3'],
    composition: 'Polyester Blend',
    origin: 'Imported',
    shippingTier: 'Standard (7-12 Days)',
    images: ['https://images.unsplash.com/photo-1577900232427-18219b9115a3?q=80&w=1000'],
    descriptionHtml: '<p>Inspired by the courts...</p>',
    rating: 0, reviews: 0, lowStock: true
  },

  // --- DRESSES ---
  {
    id: 'om8',
    shopifyId: 'gid://shopify/Product/om8',
    handle: 'evening-slip-dress-black',
    name: 'The Midnight Slip',
    price: 72,
    description: 'Bias-cut styling that drapes fluidly over the body. Minimalist 90s elegance for the modern evening.',
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000', // Black dress
    relatedIds: ['om2', 'om7'],
    composition: 'Satin Finish',
    origin: 'Imported',
    shippingTier: 'Priority (5-8 Days)',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000'],
    descriptionHtml: '<p>Bias-cut styling...</p>',
    rating: 0, reviews: 0, lowStock: false
  },

  // --- ACCESSORIES ---
  {
    id: 'om9',
    shopifyId: 'gid://shopify/Product/om9',
    handle: 'silk-scarf-print',
    name: 'The Heritage Silk Scarf',
    price: 45,
    description: 'A versatile accent piece featuring an equestrain-inspired print. Wear it around the neck or tied to your handbag.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1584060622421-50e588db68a3?q=80&w=1000', // Scarf
    relatedIds: ['om1', 'om2'],
    composition: '100% Silk Feel',
    origin: 'Imported',
    shippingTier: 'Standard (7-12 Days)',
    images: ['https://images.unsplash.com/photo-1584060622421-50e588db68a3?q=80&w=1000'],
    descriptionHtml: '<p>A versatile accent piece...</p>',
    rating: 0, reviews: 0, lowStock: false
  },
  {
    id: 'om10',
    shopifyId: 'gid://shopify/Product/om10',
    handle: 'equestrian-belt-leather',
    name: 'The Equestrian Belt',
    price: 48,
    description: 'Full-grain leather with a gold-tone buckle. The finishing touch that elevates denim or trousers.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1624223204368-8a883a45391d?q=80&w=1000', // Belt
    relatedIds: ['om6', 'om5'],
    composition: 'Genuine Leather',
    origin: 'Imported',
    shippingTier: 'Standard (7-12 Days)',
    images: ['https://images.unsplash.com/photo-1624223204368-8a883a45391d?q=80&w=1000'],
    descriptionHtml: '<p>Full-grain leather...</p>',
    rating: 0, reviews: 0, lowStock: false
  }
];
