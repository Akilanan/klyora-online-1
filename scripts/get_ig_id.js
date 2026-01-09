import 'dotenv/config';

const TOKEN = "EAAMI9PRRxkUBQTjFnxS1dNZCfkRKVoSTa32l3uNGpWAsrW5rYqJWi5ZCemMY9ZCNThfZCNUZCh3BepzH9RHD9ZAirKMNc5SUcxgosOYVHz8Ud0vugu9sbBXZARBczZB2SpwlsUeHZAeLItiJw2agXmV6nieSpSxkejv0CoGNnwvH4cOnM8BzZBuqcOzPC52ACLG39EbfPZBwfrDF1TOpeUaqE0ou0DBAztuHUTaSvJCmAZDZD";

async function findInstagramID() {
    console.log("🔍 Using Token to find Instagram Business ID...");

    try {
        // 1. Get User's Pages
        const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${TOKEN}`);
        const pagesData = await pagesRes.json();

        if (pagesData.error) {
            console.error("❌ Token Error:", pagesData.error.message);
            return;
        }

        if (!pagesData.data || pagesData.data.length === 0) {
            console.error("❌ No Facebook Pages found. You must create a Facebook Page and connect your Instagram to it.");
            return;
        }

        console.log(`✅ Found ${pagesData.data.length} Facebook Page(s). Checking for connected Instagrams...`);

        for (const page of pagesData.data) {
            // 2. Check each page for connected IG User
            const igRes = await fetch(`https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${TOKEN}`);
            const igData = await igRes.json();

            if (igData.instagram_business_account) {
                console.log("\n🎉 SUCCESS! Found Instagram Business Account:");
                console.log(`   - Page Name: ${page.name}`);
                console.log(`   - IG User ID: ${igData.instagram_business_account.id}`);
                console.log(`\n⬇️ SAVE THIS TO .ENV ⬇️`);
                console.log(`IG_USER_ID=${igData.instagram_business_account.id}`);
                console.log(`IG_ACCESS_TOKEN=${TOKEN}`);
                return;
            }
        }

        console.error("❌ Found Pages, but NONE have an Instagram Business Account connected.");
        console.error("👉 Go to Facebook Page Settings > Linked Accounts > Instagram and connect it.");

    } catch (e) {
        console.error("Request Failed:", e.message);
    }
}

findInstagramID();
