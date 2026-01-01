// scripts/auto-post.js
import 'dotenv/config'; // Load .env file locally
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const CONFIG = {
    // Support both standard and VITE_ prefixed variables for local dev compatibility
    IG_ACCESS_TOKEN: process.env.IG_ACCESS_TOKEN || process.env.VITE_IG_ACCESS_TOKEN,
    IG_USER_ID: process.env.IG_USER_ID || process.env.VITE_IG_USER_ID,
    get IS_LIVE_MODE() {
        return !!(this.IG_ACCESS_TOKEN && this.IG_USER_ID);
    }
};

// --- AI Service (Simulated) ---
class GeminiAI {
    async generateCaption(productName, composition) {
        const props = [
            `Elegance redefined. The ${productName} in ${composition}. #MaisonKlyora\n\nShop at: https://klyora-2.myshopify.com`,
            `Architectural silhouette: ${productName}. Crafted from ${composition}. Shop the winter collection at https://klyora-2.myshopify.com`,
            `The art of the drape. ${productName}. Now available. #Klyora #Luxury\n\nAcquire yours: https://klyora-2.myshopify.com`,
            `Midnight textures. ${productName}. See it now on the runway aka your living room.\n\nShop: https://klyora-2.myshopify.com`
        ];
        // Simulate network delay and AI "thinking"
        await new Promise(resolve => setTimeout(resolve, 800));
        return props[Math.floor(Math.random() * props.length)];
    }
}

const gemini = new GeminiAI();

// --- Social Media Service ---
class SocialMediaService {
    async postToInstagram(caption, imageUrl) {
        if (!CONFIG.IS_LIVE_MODE) {
            console.log(`[MOCK] Instagram Post Skipped (No Keys). Mocking success.`);
            return "mock_id_123";
        }

        console.log(`[LIVE] Posting to Instagram Account: ${CONFIG.IG_USER_ID}...`);

        try {
            // Step 1: Create Container
            const containerUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
            const containerRes = await fetch(containerUrl, { method: 'POST' });
            const containerData = await containerRes.json();

            if (containerData.error) throw new Error(`Container Error: ${containerData.error.message}`);

            const creationId = containerData.id;
            console.log(`   ↳ Media Container Created: ${creationId}`);

            // Step 2: Publish Container
            const publishUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media_publish?creation_id=${creationId}&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
            const publishRes = await fetch(publishUrl, { method: 'POST' });
            const publishData = await publishRes.json();

            if (publishData.error) throw new Error(`Publish Error: ${publishData.error.message}`);

            return publishData.id;

        } catch (error) {
            console.error("   ↳ Instagram API Failed:", error.message);
            throw error; // Re-throw to handle in main loop
        }
    }
}

const socialService = new SocialMediaService();

// Product Service
async function getRandomProduct() {
    try {
        console.log("🔍 Fetching products from Shopify...");
        // Fetch public JSON of products
        const response = await fetch('https://klyora-2.myshopify.com/products.json');
        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            throw new Error("No products found in store.");
        }

        // Check for duplicates in recent posts (Deep Check: Last 50 posts)
        products = data.products || [];
    } catch (e) {
        console.error("❌ Failed to fetch products:", e.message);
        return;
    }

    if (products.length === 0) return;

    // 2. Filter using Persistent History
    let availableProducts = products.filter(p => !historyService.hasPosted(p.handle));

    // 3. Cycle Reset Logic
    if (availableProducts.length === 0) {
        console.log("🔄 Cycle complete! All products posted. Starting fresh.");
        historyService.clear();
        availableProducts = products;
    }

    // 4. Select Random
    const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const image = product.images?.[0]?.src;

    if (!image) {
        console.log("Skipping product with no image");
        return;
    }

    console.log(`🤖 Selected: ${product.title}`);

    // 5. Generate & Post
    try {
        const caption = await gemini.generateCaption(product.title, "Premium Materials");
        const postId = await socialService.postToInstagram(caption, image);

        console.log(`✅ Posted! ID: ${postId}`);

        // 6. Update History
        if (CONFIG.IS_LIVE_MODE) {
            historyService.add(product.handle);
            historyService.saveAndPush();
        }

    } catch (error) {
        console.error("❌ Failed to post:", error.message);
    }
}

runAutoPoster();
```
