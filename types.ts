
export interface Product {
  id: string;
  shopifyId: string;
  handle: string;
  name: string;
  price: number;
  formattedPrice?: string;
  description: string;
  category: 'Men' | 'Women' | 'Seasonal' | 'Exclusive' | 'Accessories' | 'Uncategorized' | 'Atelier Exclusive';
  image: string;
  relatedIds?: string[];
  composition?: string;
  origin?: string;
  inventoryStatus?: string;
  shippingTier?: string;
  variants?: ProductVariant[];
  images: string[];
  descriptionHtml: string;
  tags?: string[]; // Added for Zendrop/Supplier logic
  rating?: number;
  reviews?: number;
  lowStock?: boolean;
  availableForSale?: boolean;
}



export interface ProductVariant {
  id: string;
  title: string;
  available: boolean;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant: ProductVariant;
}

export interface SavedLook {
  id: string;
  imageUrl: string;
  productName: string;
  date: string;
}

export interface UserMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  preferredFit: 'Slim' | 'Regular' | 'Oversized';
}

export interface UserState {
  isLoggedIn: boolean;
  name: string;
  loyaltyPoints: number;
  wishlist: string[];
}

export interface Article {
  id: string;
  title: string;
  handle: string;
  publishedAt: string;
  image: string;
  excerpt: string;
  author: string;
  category: string;
  url: string;
}
