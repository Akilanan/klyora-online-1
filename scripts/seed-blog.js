import 'dotenv/config';
import fetch from 'node-fetch';

// CONFIG
const SHOP_URL = process.env.VITE_SHOPIFY_SHOP_URL || 'https://klyora-2.myshopify.com';
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

const ARTICLES = [
    {
        title: "The Art of Silence",
        author: "Maison Klyora",
        tags: "Editorial, Quiet Luxury",
        summary_html: "Exploring the quiet power of minimalism in modern fashion. Why silence says more than logos ever could.",
        body_html: `
            <p>In a world that shouts, silence is the ultimate luxury.</p>
            <p>At Maison Klyora, we believe that true style does not need to announce itself. It is felt. It is seen in the drape of a silk dress, the weight of a cashmere coat, and the confidence of the woman who wears it.</p>
            <p>Our latest collection explores this philosophy of "Quiet Luxury"—where quality replaces quantity, and heritage replaces hype.</p>
            <h3>The Estate Edit</h3>
            <p>Inspired by the private estates of the Riviera, our new pieces are designed for those who understand that true wealth is time, and true style is timeless.</p>
        `,
        image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Sustainable Luxury: A New Standard",
        author: "Maison Klyora",
        tags: "Sustainability, Innovation",
        summary_html: "How we source our premium eco-vegan leathers and why the future of luxury is ethical.",
        body_html: `
            <p>Luxury and responsibility are no longer contradictions. They are partners.</p>
            <p>We are proud to introduce our new Eco-Vegan Leather collection. Sourced from the finest sustainable ateliers in Europe, this material offers the durability and texture of traditional leather, without the environmental cost.</p>
            <p>"We do not inherit the earth from our ancestors; we borrow it from our children."</p>
        `,
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
    },
    {
        title: "Fall Preview: The Texture of Nostalgia",
        author: "Maison Klyora",
        tags: "News, Collection",
        summary_html: "A first look at the textures defining the upcoming season. Wool, Silk, and the return of the trench.",
        body_html: `
            <p>As the leaves turn, so does our palette.</p>
            <p>This Fall, we are returning to the classics. The Trench Coat. The Silk Scarf. The Wool Trouser. These are not trends; they are investments.</p>
            <p>Join us as we explore the textures of nostalgia, reimagined for the modern muse.</p>
        `,
        image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?q=80&w=2070&auto=format&fit=crop"
    }
];

async function seedBlog() {
    console.log("🌱 Starting Blog Seeding...");

    if (!ADMIN_TOKEN) {
        console.error("❌ ERROR: SHOPIFY_ADMIN_TOKEN is missing from .env");
        console.log("👉 Please follow 'shopify_admin_api_guide.md' to get your token.");
        return;
    }

    try {
        // 1. Get Blog ID (default 'News' blog)
        console.log("🔍 Finding Blog ID...");
        const blogRes = await fetch(`${SHOP_URL}/admin/api/2023-10/blogs.json`, {
            headers: { 'X-Shopify-Access-Token': ADMIN_TOKEN }
        });
        const blogData = await blogRes.json();
        const blog = blogData.blogs?.[0]; // Use first blog

        if (!blog) {
            console.error("❌ No Blog found on store. Please create a blog named 'News' in Shopify Admin first.");
            return;
        }

        console.log(`✅ Found Blog: ${blog.title} (ID: ${blog.id})`);

        // 2. Upload Articles
        for (const article of ARTICLES) {
            console.log(`📝 Uploading: "${article.title}"...`);

            const payload = {
                article: {
                    title: article.title,
                    author: article.author,
                    tags: article.tags,
                    body_html: article.body_html,
                    summary_html: article.summary_html,
                    image: { src: article.image },
                    published: true
                }
            };

            const res = await fetch(`${SHOP_URL}/admin/api/2023-10/blogs/${blog.id}/articles.json`, {
                method: 'POST',
                headers: {
                    'X-Shopify-Access-Token': ADMIN_TOKEN,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                console.error(`   ❌ Failed: ${res.status} ${res.statusText}`);
            } else {
                console.log(`   ✅ Published!`);
            }
        }

        console.log("\n🎉 Blog Seeded Successfully! Go check your homepage.");

    } catch (e) {
        console.error("❌ Script Error:", e.message);
    }
}

seedBlog();
