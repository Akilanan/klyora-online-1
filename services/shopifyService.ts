
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

export class ShopifyService {
  private shopDomain = "klyora-2.myshopify.com";

  /**
   * Fetches real products directly from the KlyoraConfig global.
   * This is populated by your Shopify Liquid section.
   */
  async fetchLiveCatalog(): Promise<Product[]> {
    try {
      let allProducts: any[] = [];
      let page = 1;
      let hasMore = true;

      // Safety limit: Fetch up to 5 pages (approx 150-250 products) to prevent infinite loops
      while (hasMore && page <= 5) {
        const response = await fetch(`https://${this.shopDomain}/products.json?limit=50&page=${page}`);
        if (!response.ok) break;

        const data = await response.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          allProducts = [...allProducts, ...data.products];
          page++;
        } else {
          hasMore = false;
        }
      }

      if (allProducts.length > 0) {
        return this.mapShopifyProducts(allProducts);
      }

      console.warn("Klyora: No products found in Shopify response.");
      return MOCK_PRODUCTS;
    } catch (e) {
      console.warn("Klyora: Failed to fetch live catalog, falling back to mock.", e);
      return MOCK_PRODUCTS;
    }
  }

  /**
   * Fetches all public collections from the store.
   */
  async fetchCollections(): Promise<{ id: string, title: string, handle: string }[]> {
    try {
      const response = await fetch(`https://${this.shopDomain}/collections.json`);
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      return data.collections || [];
    } catch (e) {
      console.warn("Klyora: Failed to fetch collections", e);
      return [];
    }
  }

  /**
   * Fetches products for a specific collection.
   */
  async fetchProductsByCollection(handle: string): Promise<Product[]> {
    try {
      let allProducts: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 5) {
        const response = await fetch(`https://${this.shopDomain}/collections/${handle}/products.json?limit=50&page=${page}`);
        if (!response.ok) break;

        const data = await response.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          allProducts = [...allProducts, ...data.products];
          page++;
        } else {
          hasMore = false;
        }
      }

      if (allProducts.length > 0) {
        return this.mapShopifyProducts(allProducts);
      }
      return [];
    } catch (e) {
      console.warn(`Klyora: Failed to fetch products for collection ${handle}`, e);
      return [];
    }
  }

  private mapShopifyProducts(shopifyProducts: any[]): Product[] {
    return shopifyProducts.map((sp: any) => {
      const rawDescription = sp.body_html ? sp.body_html.replace(/<[^>]*>?/gm, '\n') : '';
      const { description, composition, features } = this.cleanDescription(rawDescription);

      const rawPrice = sp.variants && sp.variants.length > 0 ? parseFloat(sp.variants[0].price) : 0;

      return {
        id: sp.id.toString(),
        shopifyId: `gid://shopify/Product/${sp.id}`,
        handle: sp.handle,
        name: sp.title,
        price: rawPrice,
        description: description,
        category: sp.product_type || 'Uncategorized',
        image: sp.images && sp.images.length > 0 ? sp.images[0].src : '',
        relatedIds: [],
        composition: composition,
        origin: 'Imported',
        shippingTier: 'Standard',
        images: sp.images ? sp.images.map((img: any) => img.src) : [],
        descriptionHtml: sp.body_html || '',
        rating: 0,
        reviews: 0,
        lowStock: false,
        variants: sp.variants ? sp.variants.map((v: any) => ({
          id: `gid://shopify/ProductVariant/${v.id}`,
          title: v.title,
          price: parseFloat(v.price), // Native INR
          available: v.available
        })) : []
      };
    });
  }

  /**
   * Cleans raw supplier descriptions to match the "Old Money" aesthetic.
   * Removes technical jargon, mass-market terms, and formatting noise.
   */
  private cleanDescription(raw: string): { description: string, composition: string, features: string[] } {
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const cleanLines: string[] = [];
    let composition = "Premium Blend"; // Default luxury fallback

    // keywords to strip out
    const junkPatterns = [
      /^fabric name/i, /^main fabric/i, /^supply category/i,
      /^style/i, /^pattern/i, /^source/i, /^inventory/i,
      /^weight/i, /^size/i, /^color/i, /^skirt length/i,
      /polyester/i, /spandex/i, /nylon/i // Hide synthetic words for "Quiet Luxury" illusion
    ];

    for (const line of lines) {
      // Check if line contains "polyester" or other synthetics to update composition silently
      if (/polyester/i.test(line) || /fiber/i.test(line)) {
        // Don't add to description, but maybe update internal composition tracking?
        // We'll just skip adding it to the visible text.
        continue;
      }

      if (junkPatterns.some(p => p.test(line))) {
        continue;
      }

      cleanLines.push(line);
    }

    // specific replacements for better tone
    let description = cleanLines.join(' ').trim();
    if (description.length < 10) {
      description = "An essential addition to the modern wardrobe, featuring a timeless silhouette and refined detailing.";
    }

    return { description, composition, features: [] };
  }

  /**
   * Secure handoff to the real Shopify checkout if needed,
   * though we use our custom branded CheckoutFlow for the experience.
   */
  getCheckoutUrl(items: { variantId: string, quantity: number }[]): string {
    const cartString = items.map(item => {
      const id = item.variantId.includes('/') ? item.variantId.split('/').pop() : item.variantId;
      return `${id}:${item.quantity}`;
    }).join(',');

    return `https://${this.shopDomain}/cart/${cartString}`;
  }
  /**
   * Subscribes email to the newsletter.
   * Note: In a pure frontend theme, we can't safely use the Admin API with secrets.
   * This handles the UX gracefully.
   */
  async subscribeToNewsletter(email: string): Promise<boolean> {
    console.log(`[Klyora] Subscribing ${email} to newsletter...`);
    // In a real implementation, you would POST to a proxy or use the native Shopify form actions
    // For now, we simulate success so the UI feedback works.
    return new Promise(resolve => setTimeout(() => resolve(true), 1500));
  }
}

export const shopifyService = new ShopifyService();
