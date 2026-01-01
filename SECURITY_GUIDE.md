# How to Prevent Your API Key from "Expiring" (Revocation)

If your API key stopped working after a few days, it's likely because it was detected in public code (like on GitHub) and Google automatically revoked it for your safety.

To fix this permanently, you need to tell Google: **"It is okay if this key is public, as long as the request comes from MY website."**

### Step-by-Step Guide

1.  **Go to Google Cloud Console**:
    *   Open [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
    *   Make sure you are in the same project where you created the key.

2.  **Edit Your Key**:
    *   Find the API Key you just created (`AIzaSyCKb...`).
    *   Click the **Three Dots** icon or the **Edit (Pencil)** icon next to it.

3.  **Add Website Restrictions**:
    *   Under **"Application restrictions"**, select **"Websites"**.
    *   Under **"Website restrictions"**, click **"ADD"**.
    *   Add your Shopify domain: `https://klyora-2.myshopify.com/*`
    *   (Optional but recommended) Add your local testing URL: `http://localhost:5173/*`

4.  **Save**:
    *   Click **"Save"**.

### What this does
Now, even if a hacker (or GitHub's scanner) sees your key, they cannot use it because they aren't sending the request from `klyora-2.myshopify.com`. Google will see the restriction and **NOT revoke the key**, even if it's public.
