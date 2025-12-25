
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
      // @ts-ignore
      const config = window.KlyoraConfig;
      
      if (config && config.products) {
        return config.products;
      }
      
      console.warn("Klyora Atelier: Using internal collection archive (Local Env).");
      return MOCK_PRODUCTS;
    } catch (e) {
      return MOCK_PRODUCTS;
    }
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
}

export const shopifyService = new ShopifyService();
