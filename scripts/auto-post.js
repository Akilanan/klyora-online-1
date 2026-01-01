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
        let recentCaptions = [];
        if (CONFIG.IS_LIVE_MODE) {
            try {
                // Increased limit to 100 (Max allowed per page) to cover ~4 days of history
                const recentPostsUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media?fields=caption&limit=100&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
                const recentRes = await fetch(recentPostsUrl);
                const recentData = await recentRes.json();
                if (recentData.data) {
                    recentCaptions = recentData.data.map(p => p.caption || "");
                }
            } catch (e) {
                console.warn("⚠️ Could not fetch recent posts for duplicate check:", e.message);
            }
        }

        const products = data.products;

        // Filter out products that have been posted recently
        let availableProducts = products.filter(p => {
            return !recentCaptions.some(caption => caption.includes(p.title));
        });

        // FALLBACK: If we have posted *everything* in the store, reset and pick from ALL products.
        // This ensures the bot never stops working.
        if (availableProducts.length === 0) {
            console.log("🔄 Cycle complete! All products have been posted. Starting fresh cycle.");
            availableProducts = products;
        }

        // Randomly pick one from the available list
        const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];

        // Find first image
        const image = randomProduct.images && randomProduct.images.length > 0
            ? randomProduct.images[0].src
            : null;

        if (!image) throw new Error(`Product ${randomProduct.title} has no image.`);

        // Clean description for composition (simple heuristic)
        // Just using title and generic composition for now as description formatting varies
        return {
            name: randomProduct.title,
            composition: "Premium Materials", // Placeholder or extract from HTML if robust parsing text exists
            image: image
        };

    } catch (error) {
        console.error("❌ Failed to fetch products:", error.message);
        return null; // Return null so main loop can handle it
    }
}

async function runAutoPoster() {
    console.log("⚡ Starting Klyora Social Auto-Poster...");
    console.log(`   Mode: ${CONFIG.IS_LIVE_MODE ? "🟢 LIVE (Real Posting)" : "⚪ SIMULATION (Log Only)"}`);
    console.log("----------------------------------------");

    const logFile = path.join(__dirname, 'social_queue.log');

    // Get ONE random product to post
    const product = await getRandomProduct();

    if (!product) {
        console.log("⚠️ No product to post. Exiting.");
        return;
    }

    console.log(`🤖 Analyzing product: ${product.name}...`);

    try {
        const caption = await gemini.generateCaption(product.name, product.composition);
        const timestamp = new Date().toISOString();

        // Attempt Post
        const postId = await socialService.postToInstagram(caption, product.image);

        // Log Result
        const status = CONFIG.IS_LIVE_MODE ? "LIVE_POSTED" : "MOCK_POSTED";
        const logEntry = `[${timestamp}] [${status}] ID:${postId} CAPTION: "${caption}"\n`;

        fs.appendFileSync(logFile, logEntry);
        console.log(`✅ Success! [${status}] ID: ${postId}`);

    } catch (error) {
        console.error(`❌ Failed to post ${product.name}:`, error.message);
    }

    console.log("----------------------------------------");
    console.log("🎉 Queue processing complete.");
}

runAutoPoster();
