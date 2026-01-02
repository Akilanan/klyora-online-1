
const shopDomain = "klyora-2.myshopify.com";

async function testFetch() {
    console.log("Fetching page 1...");
    const res1 = await fetch(`https://${shopDomain}/products.json?limit=5`);
    const data1 = await res1.json();
    console.log(`Page 1 count: ${data1.products.length}`);
    if (data1.products.length > 0) console.log(`First product: ${data1.products[0].title}`);

    console.log("Fetching page 2...");
    const res2 = await fetch(`https://${shopDomain}/products.json?limit=5&page=2`);
    const data2 = await res2.json();
    console.log(`Page 2 count: ${data2.products.length}`);
    if (data2.products.length > 0) console.log(`First product page 2: ${data2.products[0].title}`);
}

testFetch();
