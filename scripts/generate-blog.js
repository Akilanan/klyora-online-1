import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

const TOPICS = [
    "The Return of Silence: Why Logo-Mania is Dead",
    "Fabric Science 101: Why Vicuña Costs More Than Gold",
    "The 24-Hour Guide to Le Marais, Paris",
    "Investing in Your Wardrobe: The Cost Per Wear Theory",
    "The Art of the Capsule: 5 Pieces for Life"
];

async function generateBlogPosts() {
    console.log("⚡ Starting Klyora Luxury Blog Generator...");

    if (!genAI) {
        console.error("❌ No API Key found.");
        return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    let output = "# Maison Klyora: Generated Editorial Content\n\n";

    for (const topic of TOPICS) {
        console.log(`📝 Writing: ${topic}...`);

        try {
            const prompt = `Write a high-end fashion blog post about "${topic}".
            
            Tone: Ultra-luxury, "Old Money", editorial, sophisticated (think Monocle, Vogue, The Gentlewoman).
            Audience: High-net-worth individuals, aesthetic conscious.
            Structure:
            - Catchy but elegant Headline
            - 300 words body text
            - Use short paragraphs
            - Avoid salesy language, focus on lifestyle and philosophy.
            - Mention "Maison Klyora" subtly once as the solution.
            
            Format: Markdown.`;

            const result = await model.generateContent(prompt);
            const content = result.response.text();

            output += `---\n## ${topic}\n\n${content}\n\n`;

        } catch (e) {
            console.error(`❌ Failed to write ${topic}:`, e.message);
        }
    }

    const outDir = path.join(__dirname, '../generated_marketing_content');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const outFile = path.join(outDir, `blog_posts_${new Date().toISOString().split('T')[0]}.md`);
    fs.writeFileSync(outFile, output);

    console.log(`✅ Success! Generated ${TOPICS.length} articles.`);
    console.log(`📂 Saved to: ${outFile}`);
}

generateBlogPosts();
