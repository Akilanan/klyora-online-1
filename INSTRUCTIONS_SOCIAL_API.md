# How to Get Your Instagram "Live Mode" Keys 🔑

To enable the Klyora Social Auto-Poster to publish to your real command, you need two things from Meta:

1.  **IG_ACCESS_TOKEN** (The Key)
2.  **IG_USER_ID** (The Lock)

Follow these exact steps:

### Step 1: Create a Meta App
1.  Go to [developers.facebook.com](https://developers.facebook.com/) and log in.
2.  Click **My Apps** (top right) -> **Create App**.
3.  Select **Other** -> **Next**.
4.  Select **Business** -> **Next**.
5.  Name it `Klyora Social` and click **Create App**.

### Step 2: Add Instagram to the App
1.  On the App Dashboard, scroll down to find **Instagram Graph API**.
2.  Click **Set Up**.

### Step 3: Generate the Token via Graph Explorer
1.  In the left sidebar, go to **Tools** -> **Graph API Explorer**.
2.  **Meta App**: Ensure "Klyora Social" is selected.
3.  **User or Page**: Select "Get User Access Token".
    *   *Note*: If asked, authorize with your Facebook account that manages the Page.
4.  **Permissions** (Crucial):
    *   Click the "Add a Permission" dropdown.
    *   Search for and add: `instagram_basic`
    *   Search for and add: `instagram_content_publish`
    *   *Also recommended*: `pages_show_list`, `pages_read_engagement`.
5.  Click **Generate Access Token**.
    *   A popup will ask you to confirm. Select your **Facebook Business Page** and your **Instagram Business Account**.
6.  **Copy the Token**: This long string in the "Access Token" field is your **IG_ACCESS_TOKEN**.

### Step 4: Get Your User ID
1.  In the same Graph API Explorer.
2.  In the query bar (where it says `me?fields=id,name`), delete everything and type:
    `me/accounts?fields=instagram_business_account`
3.  Click **Submit**.
4.  Look at the JSON response. Find the `id` inside `instagram_business_account`.
    *   It will look like: `"instagram_business_account": { "id": "178414000..." }`
5.  This number is your **IG_USER_ID**.

### Final Step
Paste them into the chat like this:
```
Token: [YOUR_TOKEN]
ID: [YOUR_ID]
```
I will handle the rest!
