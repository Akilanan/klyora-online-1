
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

    private DB_KEY = 'klyora_zendrop_inventory';

    // Initial "Seed" Data
    private seedDatabase: Record<string, ZendropData> = {
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

    private _getDb(): Record<string, ZendropData> {
        try {
            const saved = localStorage.getItem(this.DB_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) { console.warn("Zendrop DB Read Error", e); }

        // Initialize if empty
        localStorage.setItem(this.DB_KEY, JSON.stringify(this.seedDatabase));
        return this.seedDatabase;
    }

    private _saveDb(db: Record<string, ZendropData>) {
        localStorage.setItem(this.DB_KEY, JSON.stringify(db));
    }

    async getSupplierInfo(product: Product): Promise<ZendropData> {
        // 1. Live Tag Override
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

        // 2. Persistent Simulation
        await new Promise(resolve => setTimeout(resolve, 300)); // Minimal network latency
        const db = this._getDb();
        return db[product.id] || db['default'];
    }

    /**
     * Simulation: Decrement stock when user "buys" item.
     * Call this from App.tsx handleCheckout or similar.
     */
    async decrementStock(productId: string, quantity: number): Promise<boolean> {
        const db = this._getDb();
        const data = db[productId] || db['default'];

        if (data.stockLevel < quantity) return false;

        // Update DB
        const newData = { ...data, stockLevel: data.stockLevel - quantity };

        // If it was using default, we must now instantiate a specific record for this product
        db[productId] = newData;

        this._saveDb(db);
        console.log(`[Zendrop] Stock decremented for ${productId}. New Level: ${newData.stockLevel}`);
        return true;
    }

    checkMarginHealth(product: Product): boolean {
        return true;
    }
}

export const zendropService = new ZendropService();
