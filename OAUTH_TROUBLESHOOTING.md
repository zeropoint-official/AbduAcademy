# OAuth "Invalid Redirect" Troubleshooting

## Issue: Redirect URI is Truncated

If your redirect URI ends with `/cal` instead of `/callback`, it's incomplete. Here's how to fix it:

## Step-by-Step Fix

### 1. Get the Correct Redirect URI from Appwrite

1. Go to **Appwrite Console**: https://appwrite.zeropoint.company
2. Navigate to **Settings** → **Auth** → **Providers**
3. Click on **Google** provider
4. Look for the **Redirect URL** field - it should show something like:
   ```
   https://appwrite.zeropoint.company/v1/auth/oauth2/google/callback
   ```
   OR
   ```
   https://appwrite.zeropoint.company/v1/account/sessions/oauth2/google/callback
   ```
5. **Copy the ENTIRE URL** - make sure it ends with `/callback`, not `/cal`

### 2. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. In **Authorized redirect URIs** section:
   - **Delete** the incomplete URI (`/cal` ending)
   - Click **+ Add URI**
   - Paste the **complete redirect URI** from Appwrite (should end with `/callback`)
   - Click **Save**

### 3. Verify Appwrite Platform Configuration

1. In Appwrite Console, go to **Settings** → **Platforms**
2. Make sure you have a **Web** platform added with:
   - **Development**: `http://localhost:3000`
   - **Production**: Your production domain (if applicable)
3. If not added, click **Add Platform** → **Web** → Add `http://localhost:3000`

### 4. Verify Appwrite Provider Configuration

1. In Appwrite Console, go to **Settings** → **Auth** → **Providers**
2. Click on **Google**
3. Verify:
   - Provider is **Enabled**
   - **Client ID** matches your Google Cloud Console Client ID
   - **Client Secret** matches your Google Cloud Console Client Secret
4. Click **Update** if you made changes

## Common Mistakes

❌ **Wrong**: `https://appwrite.zeropoint.company/v1/account/sessions/oauth2/cal`
✅ **Correct**: `https://appwrite.zeropoint.company/v1/account/sessions/oauth2/callback/google/YOUR_PROJECT_ID`

❌ **Wrong**: Adding your app URL (`http://localhost:3000`) to Google redirect URIs
✅ **Correct**: Add Appwrite's callback URL to Google, add your app URL to Appwrite Platforms

## Authorized JavaScript Origins

For Appwrite OAuth, **Authorized JavaScript origins** can be:
- **Left empty** (recommended) - Appwrite handles OAuth server-side, so JavaScript origins aren't needed
- **OR** add your Appwrite endpoint: `https://appwrite.zeropoint.company` (if Google requires it)

**Note**: Since Appwrite manages the OAuth flow on its servers, you typically don't need JavaScript origins configured.

## Testing

After fixing:
1. Clear your browser cache/cookies
2. Try Google sign-up again
3. Check browser console for any errors
4. Verify the redirect flow works

## Still Having Issues?

If you still get "Invalid redirect" after fixing the URI:

1. **Wait 5-10 minutes** - OAuth changes can take time to propagate
2. **Check for typos** - URLs are case-sensitive and must match exactly
3. **Verify protocol** - Make sure you're using `https://` (not `http://`) for Appwrite URLs
4. **Check Appwrite logs** - Look for OAuth-related errors in Appwrite Console
