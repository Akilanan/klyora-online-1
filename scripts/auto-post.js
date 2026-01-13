import { GoogleGenerativeAI } from '@google/generative-ai';
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
    SHOPIFY_SHOP_URL: process.env.VITE_SHOPIFY_SHOP_URL || 'https://klyora-2.myshopify.com',
    DISPLAY_SHOP_URL: 'https://klyora-2.myshopify.com',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
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

// --- Caption Generator (AI Powered with Fallback) ---
class AICaptionGenerator {
    constructor() {
        this.genAI = CONFIG.GEMINI_API_KEY ? new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY) : null;
    }

    async generateCaption(productName) {
        if (this.genAI) {
            try {
                const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Write a very short, ultra-luxury, "Quiet Luxury" aesthetic Instagram caption for a fashion item called "${productName}".
                
                Guidelines:
                - Tone: Haughty, understated, exclusive, "if you know, you know".
                - Keywords to invoke: Heritage, Estate, Legacy, Silence, Private, Atelier, 1990s.
                - Length: Extremely concise (under 10 words).
                - Formatting: Lowercase or Sentence case. No shouting.
                - Emojis: Use strictly 1 or 2 monochrome/neutral emojis (e.g., 🦢, 🕯️, 🕰️, 🎞️, 🥃).
                - NO hashtags in the sentence.
                - FORBIDDEN WORDS: Do NOT use the words "Old Money", "Wealth", or "Rich".
                - End strictly with: "Link in Bio."
                `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();

                if (!text.toLowerCase().includes("bio")) {
                    return `${text}\n\nShop: ${CONFIG.DISPLAY_SHOP_URL}\nLink in Bio.`;
                }
                return `${text}\n${CONFIG.DISPLAY_SHOP_URL}`;
            } catch (error) {
                console.warn("⚠️ AI Generation Failed (using fallback):", error.message);
            }
        } else {
            console.warn("⚠️ No API Key found (using fallback).");
        }

        return this.generateFallbackCaption(productName);
    }

    // --- LUXURY SANITIZER ---
    // Transforms cheap dropshipping names into "Quiet Luxury" titles
    sanitizeProductName(rawName) {
        let name = rawName;
        // 1. Remove "Cheap" Keywords
        const garbage = ['2024', '2025', 'New', 'Arrival', 'Women', 'Men', 'Hot', 'Sale', 'Fashion', 'Trend', 'Style', 'Summer', 'Winter'];
        garbage.forEach(g => {
            const regex = new RegExp(`\\b${g}\\b`, 'gi');
            name = name.replace(regex, '');
        });

        // 2. Remove Special Chars
        name = name.replace(/[^a-zA-Z\\s]/g, '').trim();

        // 3. Add Pretentious Prefix if missing
        if (!name.startsWith('The ')) {
            name = `The ${name}`;
        }

        return name;
    }

    generateFallbackCaption(productName, productType = 'Fashion') {
        const cleanName = this.sanitizeProductName(productName);

        // HERITAGE DICTIONARY (No "Old Money")
        const openers = [
            "The estate edit.", "Quiet Sundays.", "Inherited style.", "Private collection.",
            "Members only.", "For the club.", "Leisure class.", "Timeless silence.",
            "Heritage piece.", "Modern nobility.", "The unspoken code.", "Subtle power.",
            "Alpine weekends.", "Riviera standard.", "Legacy in form."
        ];

        const middles = [
            `${cleanName}.`, `Detailed: ${cleanName}.`, `Notes on ${cleanName}.`,
            `Wearing ${cleanName}.`, `The texture of silence.`, `Understated ${cleanName}.`,
            `Simply ${cleanName}.`, `Essential ${cleanName}.`
        ];

        const closers = [
            "Acquire now.", "View the archive.", "Limited release.", "For the few.",
            "Maison Klyora.", "Exclusively online.", "Personal shopper link in bio."
        ];

        // --- VIRAL OVERRIDE (30% Chance) ---
        // Uses specific, high-performance hooks designed for "Old Money" trends
        if (Math.random() > 0.7) {
            const viralOptions = [
                // Trend: Silence / Confidence
                `The art of silence. 🦢\n.\nLink in Bio to acquire.\n#MaisonKlyora #QuietLuxury`,

                // Trend: Gatekeeping / Reverse Psychology
                `Sorry, it's a secret. 🤫\n(Link in Bio if you must know).\n#Klyora #Gatekeeping`,

                // Trend: Urgency / Scarcity
                `Few remain. The archive is closing.\nSecure your piece before it's gone.\n.\nTap Link in Bio.\n#LimitedEdition #SilkDress`,

                // Trend: Lifestyle / Routine
                `Sunday morning essentials.\nWearing ${cleanName}.\n.\nShop the look via Link in Bio.\n#SundayMorning #ParisianStyle`,

                // Trend: Investment Brief
                `Quality > Quantity. Always.\nInvest in your legacy.\n.\nLink in Bio.\n#SustainableFashion #WardrobeEssentials`
            ];
            return viralOptions[Math.floor(Math.random() * viralOptions.length)];
        }

        // Monochrome & Classy Emojis
        const emojis = ["🦢", "🕰️", "🕯️", "♟️", "🎞️", "🥃", "🗝️", "🎻", "🌲", "🐎"];

        // DYNAMIC LUXURY TAGS
        let nicheTags = "";
        const type = productType.toLowerCase();
        if (type.includes('dress') || type.includes('gown')) nicheTags = "#EveningWear #GalaReady #SilkDress";
        else if (type.includes('shirt') || type.includes('blouse') || type.includes('top')) nicheTags = "#Tailoring #CrispWhite #AtelierWork";
        else if (type.includes('pant') || type.includes('trouser') || type.includes('skirt')) nicheTags = "#Pleated #Silhouette #Trousers";
        else if (type.includes('bag') || type.includes('purse')) nicheTags = "#LeatherGoods #ItBag #HandbagAddict";
        else if (type.includes('jewel') || type.includes('ring') || type.includes('necklace')) nicheTags = "#Heirloom #GoldDetails #FineJewelry";
        else nicheTags = "#CuratedStyle #WardrobeEssentials";

        const hashtags = `#QuietLuxury #MaisonKlyora ${nicheTags} #Timeless`;

        const open = openers[Math.floor(Math.random() * openers.length)];
        const mid = middles[Math.floor(Math.random() * middles.length)];
        const close = closers[Math.floor(Math.random() * closers.length)];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        // Minimalist structures
        const template = Math.floor(Math.random() * 3);

        if (template === 0) {
            return `${open} ${mid}\n\n${emoji}\n\n${hashtags}\n\nLink in Bio.`;
        } else if (template === 1) {
            return `${mid} ${emoji}\n${close}\n\n${hashtags}\n\nLink in Bio to shop.`;
        } else {
            return `${open}\n${mid}\n\n${emoji}\n\n${hashtags}\n\nTap Link in Bio.`;
        }
    }
}

const gemini = new AICaptionGenerator();

// --- Social Media Service ---
class SocialMediaService {
    async postToInstagram(caption, feedImageUrl, storyImageUrl) {
        if (!CONFIG.IS_LIVE_MODE) {
            console.log(`[MOCK] Instagram Post Skipped (No Keys). Mocking success.`);
            return { feedId: "mock_feed_123", storyId: "mock_story_123" };
        }

        console.log(`[LIVE] Posting to Instagram Account: ${CONFIG.IG_USER_ID}...`);

        try {
            // 1. Post to FEED
            // Step A: Create Container
            const containerUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media?image_url=${encodeURIComponent(feedImageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
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
            const storyContainerUrl = `https://graph.facebook.com/v18.0/${CONFIG.IG_USER_ID}/media?image_url=${encodeURIComponent(storyImageUrl)}&media_type=STORIES&access_token=${CONFIG.IG_ACCESS_TOKEN}`;
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
    const args = process.argv.slice(2);
    if (CONFIG.IS_LIVE_MODE && !args.includes('--force')) {
        const delay = Math.floor(Math.random() * (900000 - 120000) + 120000); // 2-15 mins
        console.log(`🛡️ SAFETY PROTOCOL: Sleeping for ${Math.floor(delay / 1000)}s to mimic human behavior... (Use --force to skip)`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    const historyService = new HistoryService();
    historyService.load();
    const logFile = path.join(__dirname, 'social_queue.log');

    // 1. Fetch Products
    let products = [];
    try {
        const url = `${CONFIG.SHOPIFY_SHOP_URL}/products.json`;
        console.log(`🔍 Fetching products from: ${url}`);

        // Add User-Agent to bypass Shopify bot protection
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        const data = await response.json();
        products = data.products || [];
        console.log(`✅ Successfully fetched ${products.length} products.`);

    } catch (e) {
        console.error("❌ Failed to fetch products (Network Issue):", e.message);
        return; // Fail loudly rather than posting fake data
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


    // 4. Select Random Product
    const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];


    // 5. Smart Image Selection (The "Vogue" Swap)
    // PROBLEM: User's web photos are low quality.
    // SOLUTION: Use curated "Stock" photography that matches the Vibe, not the exact pixel.

    let bestImage = null;

    const STOCK_LIBRARY = {
        dresses: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1080&auto=format&fit=crop", // Silk Back
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1080&auto=format&fit=crop", // Blue Gown
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1080&auto=format&fit=crop",  // White Editorial
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1080&auto=format&fit=crop",  // Black Evening
            "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1080&auto=format&fit=crop",  // Velvet
            "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1080&auto=format&fit=crop",  // Linen Texture
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1080&auto=format&fit=crop"   // Floral High End
        ],
        tops: [
            "https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=1080&auto=format&fit=crop", // White Shirt
            "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1080&auto=format&fit=crop",  // Texture Detail
            "https://images.unsplash.com/photo-1551163943-3f6a29e39454?q=80&w=1080&auto=format&fit=crop",  // Beige Knit
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1080&auto=format&fit=crop",  // White Cloth
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1080&auto=format&fit=crop"   // Linen Shirt
        ],
        outerwear: [
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1080&auto=format&fit=crop", // Beige Coat
            "https://images.unsplash.com/photo-1544923246-77307dd65c74?q=80&w=1080&auto=format&fit=crop",  // Black Coat
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1080&auto=format&fit=crop", // Jacket Detail
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1080&auto=format&fit=crop",  // Trench
            "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1080&auto=format&fit=crop"   // Grey Wool
        ],
        jewelry: [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1080&auto=format&fit=crop", // Gold Detail
            "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1080&auto=format&fit=crop",  // Pearl/Silver
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1080&auto=format&fit=crop",  // Ring Detail
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1080&auto=format&fit=crop",  // Diamond Light
            "https://images.unsplash.com/photo-1651160604965-986bdf6a2977?q=80&w=1080&auto=format&fit=crop"   // Gold Watch
        ],
        bags: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1080&auto=format&fit=crop", // Luxury Bag
            "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1080&auto=format&fit=crop",  // Detail Texture
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1080&auto=format&fit=crop",  // Leather Clutch
            "https://images.unsplash.com/photo-1598532163257-ae3cde09909c?q=80&w=1080&auto=format&fit=crop"   // Minimalist Tote
        ]
    };

    const title = product.title.toLowerCase();
    const type = product.product_type ? product.product_type.toLowerCase() : "";

    if (title.includes('dress') || title.includes('gown') || type.includes('dress')) {
        bestImage = STOCK_LIBRARY.dresses[Math.floor(Math.random() * STOCK_LIBRARY.dresses.length)];
    } else if (title.includes('coat') || title.includes('jacket') || title.includes('blazer') || type.includes('outer')) {
        bestImage = STOCK_LIBRARY.outerwear[Math.floor(Math.random() * STOCK_LIBRARY.outerwear.length)];
    } else if (title.includes('shirt') || title.includes('top') || title.includes('blouse')) {
        bestImage = STOCK_LIBRARY.tops[Math.floor(Math.random() * STOCK_LIBRARY.tops.length)];
    } else if (title.includes('ring') || title.includes('necklace') || title.includes('earring') || title.includes('watch')) {
        bestImage = STOCK_LIBRARY.jewelry[Math.floor(Math.random() * STOCK_LIBRARY.jewelry.length)];
    } else if (title.includes('bag') || title.includes('tote') || title.includes('purse')) {
        bestImage = STOCK_LIBRARY.bags[Math.floor(Math.random() * STOCK_LIBRARY.bags.length)];
    } else {
        // Generic Luxury Fallback
        bestImage = STOCK_LIBRARY.outerwear[0];
    }


    if (!bestImage) {
        console.log("Skipping product with no meaningful images");
        return;
    }

    // SCAM FILTER: Check for bad titles
    if (product.title.toLowerCase().includes("generic") || product.title.toLowerCase().includes("sample")) {
        console.log("Skipping 'Generic/Sample' product.");
        return;
    }

    // IMAGE DEDUPLICATION LOGIC
    const lastImageFile = path.join(__dirname, 'last_image.txt');
    let lastPostedImage = "";
    try {
        if (fs.existsSync(lastImageFile)) {
            lastPostedImage = fs.readFileSync(lastImageFile, 'utf8').trim();
        }
    } catch (e) { }

    // Retry selection if it matches the last one
    if (bestImage === lastPostedImage) {
        console.log("⚠️ Image used recently. Selecting another...");
        const categoryKey = Object.keys(STOCK_LIBRARY).find(k => STOCK_LIBRARY[k].includes(bestImage)) || 'outerwear';
        const collection = STOCK_LIBRARY[categoryKey];
        // Pick a random index that is NOT the same image
        const safeCollection = collection.filter(img => img !== lastPostedImage);
        if (safeCollection.length > 0) {
            bestImage = safeCollection[Math.floor(Math.random() * safeCollection.length)];
        }
    }

    // Save this image as "Last Used" for next time
    try {
        fs.writeFileSync(lastImageFile, bestImage);
    } catch (e) { }

    console.log(`🤖 Selected Luxury Item: ${product.title}`);
    console.log(`   📸 Selected Lifestyle Shot: ${bestImage.split('?')[0].slice(-20)}...`);

    // 6. Generate & Post
    try {
        const caption = await gemini.generateCaption(product.title);
        const timestamp = new Date().toISOString();

        // Attempt Post (Feed + Story)
        const result = await socialService.postToInstagram(caption, bestImage, bestImage);

        // Log to file
        const status = CONFIG.IS_LIVE_MODE ? "LIVE_POSTED" : "MOCK_POSTED";
        fs.appendFileSync(logFile, `[${timestamp}] [${status}] FEED:${result.feedId} CAPTION: "${caption}"\n`);

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
