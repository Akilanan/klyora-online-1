
// Analytics Service for Facebook Pixel, TikTok Pixel, and GA4

// Declare global types for pixels
declare global {
    interface Window {
        fbq?: any;
        ttq?: any;
        gtag?: any;
    }
}

export const analytics = {
    // Track Page View
    pageView: () => {
        if (window.fbq) window.fbq('track', 'PageView');
        if (window.ttq) window.ttq.page();
        console.log('📊 Analytics: PageView');
    },

    // Track Product View (ViewContent)
    viewContent: (product: { id: string; name: string; price: number; currency: string }) => {
        if (window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [product.id],
                content_name: product.name,
                value: product.price,
                currency: product.currency,
                content_type: 'product'
            });
        }
        if (window.ttq) {
            window.ttq.track('ViewContent', {
                content_id: product.id,
                content_name: product.name,
                value: product.price,
                currency: product.currency
            });
        }
        console.log(`📊 Analytics: ViewContent - ${product.name}`);
    },

    // Track Add to Cart
    addToCart: (product: { id: string; name: string; price: number; variant: string; currency: string }) => {
        if (window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.id],
                content_name: product.name,
                value: product.price,
                currency: product.currency,
                content_type: 'product',
                variant: product.variant
            });
        }
        if (window.ttq) {
            window.ttq.track('AddToCart', {
                content_id: product.id,
                content_name: product.name,
                value: product.price,
                currency: product.currency
            });
        }
        console.log(`📊 Analytics: AddToCart - ${product.name} (${product.variant})`);
    },

    // Track Initiate Checkout
    initiateCheckout: (cartTotal: number, currency: string, items: any[]) => {
        if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                value: cartTotal,
                currency: currency,
                content_ids: items.map(i => i.id),
                num_items: items.length
            });
        }
        if (window.ttq) {
            window.ttq.track('InitiateCheckout', {
                value: cartTotal,
                currency: currency,
                contents: items.map(i => ({ content_id: i.id, content_name: i.name }))
            });
        }
        console.log(`📊 Analytics: InitiateCheckout - ${currency}${cartTotal}`);
    }
};
