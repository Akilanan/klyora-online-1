import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, ProductVariant } from '../types';
import { shopifyService } from '../services/shopifyService';
import { useUi } from './UiContext';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, variant: ProductVariant) => void;
    removeFromCart: (productId: string, variantId: string) => void;
    updateQuantity: (productId: string, variantId: string, quantity: number) => void;
    cartTotal: number;
    itemCount: number;
    checkout: (options?: { note?: string, attributes?: Record<string, string> }) => void;
    currency: string;
    setCurrency: (c: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { setIsCartOpen, showNotification } = useUi();
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('klyora_cart');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [currency, setCurrency] = useState('$');

    useEffect(() => {
        localStorage.setItem('klyora_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, variant: ProductVariant) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id && i.selectedVariant.id === variant.id);
            if (existing) {
                return prev.map(i =>
                    (i.id === product.id && i.selectedVariant.id === variant.id)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...product, selectedVariant: variant, quantity: 1 }];
        });
        setIsCartOpen(true);
        showNotification(`Added ${product.name} to bag`, 'success');
    };

    const removeFromCart = (productId: string, variantId: string) => {
        setCart(prev => prev.filter(i => !(i.id === productId && i.selectedVariant.id === variantId)));
    };

    const updateQuantity = (productId: string, variantId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId, variantId);
            return;
        }
        setCart(prev => prev.map(i =>
            (i.id === productId && i.selectedVariant.id === variantId)
                ? { ...i, quantity }
                : i
        ));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const checkout = (options?: { note?: string, attributes?: Record<string, string> }) => {
        if (cart.length === 0) return;

        const checkoutUrl = shopifyService.getCheckoutUrl(
            cart.map(i => ({ variantId: i.selectedVariant.id, quantity: i.quantity })),
            options?.note,
            options?.attributes
        );
        window.location.href = checkoutUrl;
    };

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity,
            cartTotal, itemCount, checkout,
            currency, setCurrency
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
