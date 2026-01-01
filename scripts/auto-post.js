// scripts/auto-post.js
import 'dotenv/config'; // Load .env file locally
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

// --- History Service (Git Persistence) ---
class HistoryService {
    constructor() {
        this.historyFile = path.join(__dirname, '../data/posted_history.json');
        this.history = [];
        // Ensure data directory exists
        if (!fs.existsSync(path.dirname(this.historyFile))) {
            fs.mkdirSync(path.dirname(this.historyFile), { recursive: true });
        }
    }

    load() {
        try {
            if (fs.existsSync(this.historyFile)) {
                this.history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
            }
        } catch (e) {
            console.error("⚠️ Failed to load history:", e.message);
            this.history = [];
        }
    }

    hasPosted(productHandle) {
        return this.history.includes(productHandle);
    }

    add(productHandle) {
        if (!this.history.includes(productHandle)) {
            this.history.push(productHandle);
        }
    }

    clear() {
        this.history = [];
    }

    saveAndPush() {
        try {
            // 1. Write file
            fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));

            // 2. Git Commit & Push (Only if in GitHub Actions or Local capable env)
            if (process.env.CI) {
                console.log("💾 Persisting history to GitHub...");
                execSync('git config --global user.name "Klyora Bot"');
                execSync('git config --global user.email "bot@klyora.com"');
                execSync(`git add ${this.historyFile}`);
                execSync('git commit -m "chore: Update social post history [skip ci]"');
                execSync('git push');
            } else {
                console.log("💾 History saved locally.");
            }
        } catch (e) {
            console.error("❌ Failed to save history:", e.message);
        }
    }
}

// --- Caption Generator (Human Style) ---
class HumanCaptionGenerator {
    async generateCaption(productName) {
        // High-quality, minimalist sentence fragments
        const openers = [
            "Effortless.",
            "Just landed.",
            "The moment.",
            "Pure elegance.",
            "Obsessed with this.",
            "Textures.",
            "Current mood.",
            "Timeless."
        ];

        const middles = [
            `The ${productName}.`,
            `This silhouette. 🖤`,
            `Details matter.`,
            `Your new favorite.`,
            `For the evening.`,
            `Winter essential.`,
            `Meet the ${productName}.`,
            `Simplicity is key.`
        ];

        const closers = [
            "Link in bio.",
            "Shop the edit.",
            "Available now.",
            "Yours forever.",
            "Discover more online.",
            "Limited availability."
        ];

        const emojis = ["✨", "🖤", "🕯️", "🧥", "🌑", "🎞️"];
        const hashtags = "#MaisonKlyora #QuietLuxury #Klyora #MinimalistStyle #OOTD";

        // Randomly pick one from each category
        const open = openers[Math.floor(Math.random() * openers.length)];
        const mid = middles[Math.floor(Math.random() * middles.length)];
        const close = closers[Math.floor(Math.random() * closers.length)];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        // 20% chance to just be super short (2 parts)
        if (Math.random() < 0.2) {
            return `${mid} ${emoji}\n\n${hashtags}\n\nShop at: https://klyora-2.myshopify.com`;
        }

        // Standard 3-part structure
        return `${open} ${mid} ${emoji}\n${close}\n\n${hashtags}\n\nShop at: https://klyora-2.myshopify.com`;
    }
}

const gemini = new HumanCaptionGenerator(); // Renamed for compatibility, but uses local logic

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
            throw error;
        }
    }
}

const socialService = new SocialMediaService();

// --- Main Logic ---
async function runAutoPoster() {
    console.log("⚡ Starting Klyora Social Auto-Poster...");
    const historyService = new HistoryService();
    try {
        historyService.load();
    } catch (e) { console.log("Init history empty"); }
    const logFile = path.join(__dirname, 'social_queue.log');

    // 1. Fetch Products
    let products = [];
    try {
        const response = await fetch('https://klyora-2.myshopify.com/products.json');
        const data = await response.json();
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

    // Pick a random image from the product's gallery (not just the first one)
    let image = null;
    if (product.images && product.images.length > 0) {
        const randomImageIndex = Math.floor(Math.random() * product.images.length);
        image = product.images[randomImageIndex].src;
    }

    if (!image) {
        console.log("Skipping product with no image");
        return;
    }

    console.log(`🤖 Selected: ${product.title}`);

    // 5. Generate & Post
    try {
        const caption = await gemini.generateCaption(product.title);
        const timestamp = new Date().toISOString();

        // Attempt Post
        const postId = await socialService.postToInstagram(caption, image);

        console.log(`✅ Posted! ID: ${postId}`);

        // Log to file
        const status = CONFIG.IS_LIVE_MODE ? "LIVE_POSTED" : "MOCK_POSTED";
        fs.appendFileSync(logFile, `[${timestamp}] [${status}] ID:${postId} CAPTION: "${caption}"\n`);

        // 6. Update History
        if (CONFIG.IS_LIVE_MODE) {
            historyService.add(product.handle);
            historyService.saveAndPush();
        }

    } catch (error) {
        console.error("❌ Failed to post:", error.message);
    }

    console.log("----------------------------------------");
}

runAutoPoster();
