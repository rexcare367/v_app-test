# Clearout Email Finder - Quick Setup Guide

## Step 1: Get Your API Token

1. Visit https://app.clearout.io/
2. Sign up or log in to your account
3. Navigate to API settings/dashboard
4. Copy your API token

## Step 2: Configure Environment Variable

Create a `.env` file in the root directory of your project:

```bash
CLEAROUT_API_TOKEN=your_actual_api_token_here
```

**Important**: Never commit your `.env` file to version control. It's already in `.gitignore`.

## Step 3: Start the Development Server

```bash
shopify app dev
```

## Step 4: Access the Email Finder

1. Visit the landing page at `http://localhost` (or your app URL)
2. The Email Finder form will be displayed on the home page

## Step 5: Test the Integration

Try searching for an email:
- **Name**: Steven Morris
- **Domain**: apple.com
- Click "Find Email"

## Files Created/Modified

This integration added and modified the following files:

- `app/types/email-finder.ts` - TypeScript type definitions (new)
- `app/routes/_index/route.tsx` - Updated with Email Finder functionality
- `app/routes/_index/styles.module.css` - Updated with Email Finder styles
- `app/docs/EMAIL_FINDER_API.md` - Comprehensive API documentation (new)
- `env.d.ts` - Updated with environment variable types
- `README.md` - Updated with Email Finder information

## Troubleshooting

### "API token not configured" error
- Ensure your `.env` file exists in the root directory
- Check that `CLEAROUT_API_TOKEN` is set correctly
- Restart your development server after adding the token

### No results found
- Verify the domain/company exists
- Try a different name/domain combination
- Check your Clearout account credits

### Rate limit errors
- Check your Clearout plan limits
- Wait a few moments before trying again
- Consider upgrading your plan if needed

## API Limits

Check your Clearout dashboard for:
- API request limits
- Available credits
- Rate limit information

## Need Help?

- **Clearout API Issues**: https://clearout.io/support
- **Integration Issues**: Check `app/docs/EMAIL_FINDER_API.md`
- **Shopify App Issues**: See main README.md

## Production Deployment

When deploying to production, set the environment variable in your hosting platform:

**Heroku**:
```bash
heroku config:set CLEAROUT_API_TOKEN=your_token
```

**Fly.io**:
```bash
flyctl secrets set CLEAROUT_API_TOKEN=your_token
```

**Other platforms**: Refer to your hosting provider's documentation for setting environment variables.

