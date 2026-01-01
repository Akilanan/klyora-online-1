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
            console.warn("⚠️ Failed to load history (creating new):", e.message);
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

            // 2. Git Commit & Push (Only if in GitHub Actions or Local capable env with key)
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
        // EXPANDED DICTIONARY (3,000+ Combinations)
        const openers = [
            "Effortless.", "Just landed.", "The moment.", "Pure elegance.", "Obsessed with this.",
            "Textures.", "Current mood.", "Timeless.", "In focus.", "Daily driver.",
            "Visual noise.", "Quiet confidence.", "Art form.", "The upgrade.", "Next level.",
            "Soft touch.", "Structured.", "Flow state.", "Iconic.", "Rare find.",
            "Modern classic.", "Essential.", "Refined.", "Polished.", "Mood."
        ];

        const middles = [
            `The ${productName}.`, `This silhouette. 🖤`, `Details matter.`, `Your new favorite.`,
            `For the evening.`, `Winter essential.`, `Meet the ${productName}.`, `Simplicity is key.`,
            `Cannot get enough of the ${productName}.`, `The ${productName} requires no introduction.`,
            `Wearing the ${productName} on repeat.`, `A masterclass in style.`, `Designed to last.`,
            `The perfect cut.`, `Feels as good as it looks.`, `Elevated everyday.`,
            `Made for you.`, `The ${productName} speaks for itself.`
        ];

        const closers = [
            "Link in bio.", "Shop the edit.", "Available now.", "Yours forever.",
            "Discover more online.", "Limited availability.", "Tap to view.", "Secure yours.",
            "Klyora.com", "Online now.", "Don't miss out.", "New season.",
            "Shipping worldwide.", "See the details."
        ];

        const emojis = ["✨", "🖤", "🕯️", "🧥", "🌑", "🎞️", "🥃", "🗝️", "🦢"];
        const hashtags = "#MaisonKlyora #QuietLuxury #Klyora #MinimalistStyle #OOTD";

        // Randomly pick one from each category
        const open = openers[Math.floor(Math.random() * openers.length)];
        const mid = middles[Math.floor(Math.random() * middles.length)];
        const close = closers[Math.floor(Math.random() * closers.length)];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        const template = Math.floor(Math.random() * 3);

        if (template === 0) {
            // Super minimalist
            return `${mid} ${emoji}\n\n${hashtags}\n\nShop at: https://klyora-2.myshopify.com`;
        } else if (template === 1) {
            // Standard
            return `${open} ${mid} ${emoji}\n${close}\n\n${hashtags}\n\nShop at: https://klyora-2.myshopify.com`;
        } else {
            // Editorial
            return `${open}\n${mid}\n${close}\n\n${hashtags}\n\nShop at: https://klyora-2.myshopify.com`;
        }
    }
}

const gemini = new HumanCaptionGenerator();

// --- Social Media Service ---
class SocialMediaService {
    async postToInstagram(caption, imageUrl) {
        if (!CONFIG.IS_LIVE_MODE) {
            console.log(`[MOCK] Instagram Post Skipped (No Keys). Mocking success.`);
            return "mock_id_123";
        }

        console.log(`[LIVE] Posting to Instagram Account: ${CONFIG.IG_USER_ID}...`);

        try {
            // 1. Post to FEED
            // Step A: Create Container
            const containerUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
            const containerRes = await fetch(containerUrl, { method: 'POST' });
            const containerData = await containerRes.json();
            if (containerData.error) throw new Error(`Feed Container Error: ${containerData.error.message}`);
            const feedCreationId = containerData.id;

            // Step B: Publish Container
            const publishUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media_publish?creation_id=${feedCreationId}&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
            const publishRes = await fetch(publishUrl, { method: 'POST' });
            const publishData = await publishRes.json();
            if (publishData.error) throw new Error(`Feed Publish Error: ${publishData.error.message}`);

            const feedId = publishData.id;
            console.log(`   ✅ Feed Post Published: ${feedId}`);

            // 2. Post to STORY (Bonus)
            // Stories do NOT take captions, just the image.
            console.log("   --> Attempting Story Post...");
            const storyContainerUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media?image_url=${encodeURIComponent(imageUrl)}&media_type=STORIES&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
            const storyContainerRes = await fetch(storyContainerUrl, { method: 'POST' });
            const storyContainerData = await storyContainerRes.json();

            let storyId = "SKIPPED";
            if (!storyContainerData.error) {
                const storyCreationId = storyContainerData.id;
                const storyPublishUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media_publish?creation_id=${storyCreationId}&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
                const storyPublishRes = await fetch(storyPublishUrl, { method: 'POST' });
                const storyPublishData = await storyPublishRes.json();
                if (!storyPublishData.error) {
                    storyId = storyPublishData.id;
                    console.log(`   ✅ Story Published: ${storyId}`);
                }
            } else {
                console.warn(`   ⚠️ Story failed (non-critical): ${storyContainerData.error.message}`);
            }

            return { feedId, storyId };

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

    // SAFETY: Random start delay (2 to 15 minutes) to avoid "Bot" patterns at exact :00 times
    if (CONFIG.IS_LIVE_MODE) {
        const delay = Math.floor(Math.random() * (900000 - 120000) + 120000); // 2-15 mins
        console.log(`🛡️ SAFETY PROTOCOL: Sleeping for ${Math.floor(delay / 1000)}s to mimic human behavior...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    const historyService = new HistoryService();
    historyService.load();
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

        // Attempt Post (Feed + Story)
        const result = await socialService.postToInstagram(caption, image);

        // Log to file
        const status = CONFIG.IS_LIVE_MODE ? "LIVE_POSTED" : "MOCK_POSTED";
        fs.appendFileSync(logFile, `[${timestamp}] [${status}] FEED:${result.feedId} STORY:${result.storyId} CAPTION: "${caption}"\n`);

        // 6. Update History
        if (CONFIG.IS_LIVE_MODE) {
            historyService.add(product.handle);
            historyService.saveAndPush();
        }

    } catch (error) {
        console.error("❌ Failed to post:", error.message);
        // Don't crash output
    }

    console.log("----------------------------------------");
}

runAutoPoster();
