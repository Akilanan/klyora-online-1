import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

async function generateCampaign() {
    console.log("⚡ Starting Klyora Campaign Planner...");

    if (!genAI) {
        console.error("❌ No API Key found.");
        return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const month = new Date().toLocaleString('default', { month: 'long' });

    console.log(`📝 Designing Campaign for ${month}...`);

    const prompt = `Create a comprehensive 4-week Luxury Fashion Marketing Campaign for "Maison Klyora" for the month of ${month}.
    
    Brand Identity: Old Money, Quiet Luxury, Minimalist, Exclusive.
    Target Audience: High Net Worth Individuals, Art Collectors, Minimalists.
    
    Output Format: Markdown.
    
    Structure:
    
    # Campaign Strategy: [Creative Theme Name]
    
    ## Week 1: Brand Awareness (The Story)
    - Social Post Ideas (3x) with visual description and caption.
    - 1 Tikok/Reel Script (15s).
    
    ## Week 2: Consideration (The Craft)
    - 1 Email Newsletter (Subject + Preview + Key Message).
    - 1 Blog Post Title & Outline.
    
    ## Week 3: Conversion (The Acquisition)
    - Facebook/Instagram Ad Copy (Primary Text + Headline).
    - Retargeting Ad Angle.
    
    ## Week 4: Loyalty (The Inner Circle)
    - VIP SMS Message.
    - "Secret" Offer Logic.
    
    ## Key Keywords & Hashtags
    `;

    try {
        const result = await model.generateContent(prompt);
        const content = result.response.text();

        const outDir = path.join(__dirname, '../generated_marketing_content');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const outFile = path.join(outDir, `campaign_plan_${month.toLowerCase()}.md`);
        fs.writeFileSync(outFile, content);

        console.log(`✅ Campaign Plan Generated: ${outFile}`);

    } catch (e) {
        console.error("❌ Failed to generate campaign:", e.message);
    }
}

generateCampaign();
