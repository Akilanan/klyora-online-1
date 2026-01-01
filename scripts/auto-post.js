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

GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
    // ... other config
};

// --- AI Service (Real) ---
class GeminiAI {
    async generateCaption(productName, composition) {
        if (!CONFIG.GEMINI_API_KEY) {
            console.log("⚠️ No Gemini API Key found. Using fallback caption.");
            return `The ${productName}. Experience true luxury. #Klyora`;
        }

        try {
            const prompt = `Write a short, sophisticated, high-fashion Instagram caption for a luxury clothing item named "${productName}". 
            Tone: Elegant, mysterious, exclusive.
            Include 1-2 tasteful emojis. 
            Include 5 relevant luxury hashtags (e.g. #MaisonKlyora #QuietLuxury).
            Add a clear "Link in Bio" call to action.
            Do NOT wrap the output in quotes.`;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0].content) {
                let caption = data.candidates[0].content.parts[0].text.trim();
                // Append the direct shop link as requested previously
                return `${caption}\n\nShop at: https://klyora-2.myshopify.com`;
            } else {
                throw new Error("Invalid API response format");
            }
        } catch (error) {
            console.error("⚠️ AI Generation failed, using fallback:", error.message);
            // Fallback template with shop link
            return `Introducing the ${productName}.\n\nCrafted for the modern connoisseur.\n\n#MaisonKlyora #LuxuryFashion\n\nShop at: https://klyora-2.myshopify.com`;
        }
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
