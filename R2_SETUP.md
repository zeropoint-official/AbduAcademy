# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for storing course videos, thumbnails, and attachments.

## Step 1: Create R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2** in the sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `abdu-academy-content`)
5. Choose a location (select the region closest to your users)
6. Click **Create bucket**

## Step 2: Configure Bucket as Public

1. Go to your bucket settings
2. Navigate to **Settings** → **Public Access**
3. Enable **Public Access** (this allows direct URL access to files)
4. Note the **Public URL** (format: `https://pub-xxxxx.r2.dev`)

## Step 3: Create API Token

1. In Cloudflare dashboard, go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use the **Edit Cloudflare R2** template
4. Set permissions:
   - **Account** → **Cloudflare R2** → **Edit**
5. Select your account
6. Click **Continue to summary** → **Create Token**
7. **Copy and save** the token (you won't be able to see it again)

## Step 4: Get Access Key ID and Secret Access Key

1. In R2 dashboard, go to **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions:
   - **Object Read & Write** (or **Object Admin** for full access)
4. Set TTL (or leave as "Never expire" for development)
5. Click **Create API Token**
6. **Copy and save**:
   - **Access Key ID**
   - **Secret Access Key** (you won't be able to see it again)

## Step 5: Configure CORS (REQUIRED for Direct Uploads)

1. Go to your bucket settings
2. Navigate to **Settings** → **CORS Policy**
3. Click **Edit** and add the following CORS configuration:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

**IMPORTANT:** 
- Replace `yourdomain.com` with your production domain
- **You MUST set `AllowedHeaders` to `["*"]`** (or at minimum `["Content-Type", "*"]`) to allow browser uploads
- Make sure `PUT` is included in `AllowedMethods` for presigned URL uploads
- After saving, the changes take effect immediately

## Step 6: Add Environment Variables

Add the following to your `.env.local` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=abdu-academy-content
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

**Where to find Account ID:**
- In Cloudflare dashboard, go to any page
- Your Account ID is shown in the right sidebar

**Important Notes:**
- Never commit `.env.local` to version control
- The `R2_PUBLIC_URL` should be your bucket's public endpoint
- For production, use environment variables in your hosting platform (Vercel, etc.)

## Step 7: Verify Setup

After adding environment variables, restart your Next.js dev server:

```bash
pnpm dev
```

The R2 client will validate all environment variables on startup. If any are missing, you'll see an error message.

## File Organization in R2

Files are organized in the following structure:

```
videos/
  {chapterId}/
    {episodeId}/
      {filename}.mp4

thumbnails/
  {episodeId}/
    {filename}.jpg

attachments/
  {episodeId}/
    {filename}.pdf
```

This organization makes it easy to:
- Find files by chapter/episode
- Clean up files when episodes are deleted
- Manage storage efficiently

## Troubleshooting

**Error: "Missing R2 environment variables"**
- Check that all variables are set in `.env.local`
- Restart your dev server after adding variables

**Error: "Access Denied"**
- Verify your Access Key ID and Secret Access Key are correct
- Check that your API token has the correct permissions

**Files not accessible via public URL**
- Ensure Public Access is enabled on your bucket
- Verify the R2_PUBLIC_URL matches your bucket's public endpoint
- Check that the file key matches the path structure
