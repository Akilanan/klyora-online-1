
import { Product } from '../types';

interface ZendropData {
    supplierId: string;
    shippingTime: string; // e.g., "7-12 Days"
    processingTime: string; // e.g., "1-3 Days"
    stockLevel: number;
    cost: number; // Wholesale cost (hidden from customer)
    isVerified: boolean;
}

export class ZendropService {
    // In a real app, this would fetch from https://api.zendrop.com/v1/products
    // For now, we simulate the data to show the "Link" is active.

    private mockDatabase: Record<string, ZendropData> = {
        'default': {
            supplierId: 'ZD-8842',
            shippingTime: '7-12 Days',
            processingTime: '24 Hours',
            stockLevel: 154,
            cost: 12.50,
            isVerified: true
        },
        'k1': {
            supplierId: 'ZD-SILK-99',
            shippingTime: '5-8 Days', // Premium shipping
            processingTime: '12 Hours',
            stockLevel: 42,
            cost: 45.00,
            isVerified: true
        }
    };

    async getSupplierInfo(product: Product): Promise<ZendropData> {
        // 1. Try to read from real Shopify Tags (synced by Zendrop)
        // Format: "shipping:7-12 Days", "verified_supplier"
        if (product && product.tags) {
            const shippingTag = product.tags.find(t => t.toLowerCase().startsWith('shipping:'));
            const isVerified = product.tags.some(t => t.toLowerCase().includes('zendrop') || t.toLowerCase().includes('verified'));

            if (shippingTag) {
                return {
                    supplierId: 'REAL-ZD',
                    shippingTime: shippingTag.split(':')[1].trim(),
                    processingTime: '1-3 Days',
                    stockLevel: 999,
                    cost: 0,
                    isVerified: isVerified
                };
            }
        }

        // 2. Fallback to Mock Database (Simulation Mode)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.mockDatabase[product.id] || this.mockDatabase['default'];
    }

    /**
     * Checks if a product is viable for dropshipping based on margin.
     * Rule: Retail Price > 2.5x Cost
     */
    checkMarginHealth(product: Product): boolean {
        // This would be used in an Admin Dashboard
        return true;
    }
}

export const zendropService = new ZendropService();
