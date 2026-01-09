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

    console.log(`📝 Generating High-Traffic Content for ${month}...`);

    const prompt = `You are a Viral Marketing Director for "Maison Klyora", an Ultra-Luxury "Old Money" fashion brand.
    Your goal is to generate HIGH-PERFORMING content to drive immediate traffic.

    OUTPUT FORMAT: JSON.
    DO NOT output markdown. Output raw JSON.

    Required Assets:

    1.  **3 TikTok/Reel Scripts** (Focus: "The Aesthetic", "The Secret", "The Unboxing").
        -   Format: { "hook": "...", "visual": "...", "audio_cue": "...", "caption": "..." }
    
    2.  **3 Instagram Feed Captions** (Focus: "Quiet Luxury", "Insider", "Sold Out Soon").
        -   Must use "Link in Bio" as CTA.
        -   NO hashtags in the main text (put them in a separate field).
    
    3.  **1 "Urgency" Email Blast** (Focus: "Private Access" or "Restock").
        -   Subject Line (High Open Rate).
        -   Body Copy (Short, Punchy, Exclusive).
    
    Structure the JSON exactly like this:
    {
        "tiktok_scripts": [ ... ],
        "instagram_captions": [ ... ],
        "email_campaign": { "subject": "...", "body": "..." }
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const content = JSON.parse(jsonStr);

        const outDir = path.join(__dirname, '../generated_marketing_content');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        // Save Raw JSON
        fs.writeFileSync(path.join(outDir, 'viral_content.json'), JSON.stringify(content, null, 2));

        // Generate Readable Report
        let report = `# 🚀 READY-TO-POST CONTENT (${month})\n\n`;

        report += `## 📱 TikTok / Reels Scripts\n`;
        content.tiktok_scripts.forEach((script, i) => {
            report += `### Option ${i + 1}\n`;
            report += `**Hook:** ${script.hook}\n`;
            report += `**Visual:** ${script.visual}\n`;
            report += `**Audio:** ${script.audio_cue}\n`;
            report += `**Caption:** ${script.caption}\n\n`;
        });

        report += `## 📸 Instagram Captions\n`;
        content.instagram_captions.forEach((cap, i) => {
            report += `### Option ${i + 1}\n${cap.caption || cap}\n\n`;
        });

        report += `## 📧 Email Blast\n`;
        report += `**Subject:** ${content.email_campaign.subject}\n`;
        report += `**Body:**\n${content.email_campaign.body}\n`;

        const outFile = path.join(outDir, `viral_plan_${month.toLowerCase()}.md`);
        fs.writeFileSync(outFile, report);

        console.log(`✅ Viral Content Generated: ${outFile}`);

    } catch (e) {
        console.error("❌ Failed to generate content:", e.message);
    }
}

generateCampaign();
