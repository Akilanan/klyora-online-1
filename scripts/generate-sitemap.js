import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://klyora-2.myshopify.com';
const SHOPIFY_URL = process.env.SHOPIFY_DOMAIN ? `https://${process.env.SHOPIFY_DOMAIN}` : 'https://klyora-2.myshopify.com';

async function generateSitemap() {
    console.log("🗺️  Generating Klyora Sitemap...");

    let products = [];
    try {
        const response = await fetch(`${SHOPIFY_URL}/products.json`);
        const data = await response.json();
        products = data.products || [];
    } catch (e) {
        console.warn("⚠️ Failed to fetch products (using mock):", e.message);
    }

    const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/collections/all', priority: '0.8', changefreq: 'daily' },
        { url: '/pages/about', priority: '0.5', changefreq: 'monthly' },
        { url: '/pages/contact', priority: '0.5', changefreq: 'monthly' },
        { url: '/pages/faq', priority: '0.5', changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Pages
    staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Products
    products.forEach(product => {
        xml += `
  <url>
    <loc>${BASE_URL}/products/${product.handle}</loc>
    <lastmod>${product.updated_at ? product.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);

    console.log(`✅ Sitemap mapped: ${staticPages.length} pages, ${products.length} products.`);
    console.log(`📂 Saved to: ${outputPath}`);
}

generateSitemap();
