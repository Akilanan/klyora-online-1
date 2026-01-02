# How to Get a "Permanent" (Long-Lived) Instagram Token

Instagram security policies do not allow for a truly "never-expiring" token for standard accounts. The best possible option is a **Long-Lived Access Token** which lasts for **60 days**.

## The Strategy
You will generate a token today, and it will be good until **March 2026**. You simply need to repeat this process every 2 months.

### Step 1: Get a Short-Lived Token (Lasts 1 Hour)
1. Go to the [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2. **Meta App**: Select your App.
3. **User or Page**: Select "User Token".
4. **Permissions**: Ensure the following are selected:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
5. Click **Generate Access Token**.
6. Copy this token. We will call this the `SHORT_TOKEN`.

### Step 2: Exchange for Long-Lived Token (Lasts 60 Days)
You need to perfom this exchange to get the 60-day token. You can do this right in your browser or terminal.

**You need:**
- `APP_ID` (From Meta App Dashboard -> Settings -> Basic)
- `APP_SECRET` (From Meta App Dashboard -> Settings -> Basic)
- `SHORT_TOKEN` (From Step 1)

**Run this command (replace variables):**

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_TOKEN}"
```

**Or paste this into your browser address bar:**
`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_TOKEN`

### Step 3: Update GitHub
1. The response will contain a new, long string starting with `access_token`.
2. Go to GitHub Repo -> Settings -> Secrets and variables -> Actions.
3. Update `IG_ACCESS_TOKEN` with this **new** long token.

> [!TIP]
> set a calendar reminder for 55 days from now to repeat this process so your automation never breaks!
