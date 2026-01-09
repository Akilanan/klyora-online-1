import 'dotenv/config';

// The token user provided
const TOKEN = "EAAMI9PRRxkUBQTjFnxS1dNZCfkRKVoSTa32l3uNGpWAsrW5rYqJWi5ZCemMY9ZCNThfZCNUZCh3BepzH9RHD9ZAirKMNc5SUcxgosOYVHz8Ud0vugu9sbBXZARBczZB2SpwlsUeHZAeLItiJw2agXmV6nieSpSxkejv0CoGNnwvH4cOnM8BzZBuqcOzPC52ACLG39EbfPZBwfrDF1TOpeUaqE0ou0DBAztuHUTaSvJCmAZDZD";

async function debugToken() {
    console.log("🕵️ Debugging Token Identity & Permissions...");

    try {
        // 1. Who am I?
        const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${TOKEN}`);
        const meData = await meRes.json();

        if (meData.error) {
            console.error("❌ Token Invalid:", meData.error.message);
            return;
        }

        console.log(`✅ Token Owner: ${meData.name} (ID: ${meData.id})`);

        // 2. What permissions do I have?
        const permRes = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${TOKEN}`);
        const permData = await permRes.json();

        if (permData.data) {
            console.log("📜 Permissions Granted:");
            const scopes = permData.data.map(p => `${p.permission}: ${p.status}`);
            console.log(scopes.join('\n'));

            // Critical Check
            const hasPages = permData.data.some(p => p.permission === 'pages_show_list' && p.status === 'granted');
            const hasInsta = permData.data.some(p => p.permission === 'instagram_basic' && p.status === 'granted');

            if (!hasPages) console.warn("⚠️ MISSING 'pages_show_list' - Cannot see Facebook Pages.");
            if (!hasInsta) console.warn("⚠️ MISSING 'instagram_basic' - Cannot see Instagram Account.");
        }

    } catch (e) {
        console.error("Debug Failed:", e.message);
    }
}

debugToken();
