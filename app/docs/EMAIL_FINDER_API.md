# Email Finder API Integration

This document describes the Clearout Email Finder API integration in the application.

## Overview

The Email Finder API allows you to instantly discover email addresses by providing a person's name and their domain or company name. The integration includes:

- TypeScript type definitions
- Server-side API route handler
- Frontend UI component with form and results display
- Comprehensive error handling

## Configuration

### Environment Variables

Add your Clearout API token to your `.env` file:

```env
CLEAROUT_API_TOKEN=your_api_token_here
```

Get your API token from: https://app.clearout.io/

### Type Definitions

TypeScript types are defined in `app/types/email-finder.ts`:

- `EmailFinderRequest` - Request payload structure
- `EmailFinderResponse` - API response structure
- `EmailFinderData` - Successful response data
- `EmailResult` - Individual email result

## Usage

### Accessing the Feature

1. Visit the landing page at the root route (`/`)
2. Fill in the Email Finder form with:
   - **Name**: Full name of the person (e.g., "Steven Morris")
   - **Domain**: Domain or company name (e.g., "apple.com")
   - **Timeout** (optional): Request wait time in milliseconds (10,000-180,000)

### API Endpoint

**Route**: `/` (root route)
**Method**: `POST`  
**Handler**: `app/routes/_index/route.tsx`

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name of the person |
| domain | string | Yes | Domain or company name |
| timeout | number | No | Wait time in ms (default: 30000) |

### Response Structure

#### Success Response

```json
{
  "status": "success",
  "data": {
    "emails": [
      {
        "email_address": "morris@apple.com",
        "role": "no",
        "business": "yes"
      }
    ],
    "first_name": "steven",
    "last_name": "morris",
    "full_name": "steven morris",
    "domain": "apple.com",
    "confidence_score": 83,
    "total": 1,
    "company": {
      "name": "apple"
    },
    "found_on": "2021-08-21T03:10:02.796Z"
  }
}
```

#### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Error Handling

The integration handles various error scenarios:

- **VALIDATION_ERROR**: Missing required fields
- **CONFIG_ERROR**: API token not configured
- **NETWORK_ERROR**: Connection issues
- **API_ERROR**: Clearout API specific errors (rate limits, payment required, etc.)

## UI Components

The frontend component (`app/routes/_index/route.tsx`) includes:

1. **Form Section**: Input fields for name, domain, and timeout
2. **Results Section**: Displays found emails with:
   - Email addresses (clickable mailto links)
   - Role vs Personal email badges
   - Business vs Non-Business badges
   - Confidence score
   - Company information
3. **Error Section**: User-friendly error messages
4. **Sidebar**: Information about the feature and configuration

## Features

- ✅ Real-time email discovery
- ✅ Confidence scoring
- ✅ Role vs personal email detection
- ✅ Business email verification
- ✅ Toast notifications for success/error
- ✅ Loading states during API calls
- ✅ Full response data display for debugging
- ✅ TypeScript type safety

## API Reference

Full API documentation: https://docs.clearout.io/

### Rate Limits

Refer to your Clearout plan for rate limit information.

### Timeout Configuration

- **Minimum**: 10,000 ms (10 seconds)
- **Maximum**: 180,000 ms (3 minutes)
- **Default**: 30,000 ms (30 seconds)

### Queue Mode

The integration uses queue mode by default (`queue: true`), which means email discovery continues in the background even if the request times out. Results can be retrieved later from the Clearout dashboard.

## Development

### Testing

1. Ensure your API token is configured
2. Run the development server: `shopify app dev`
3. Navigate to the Email Finder page
4. Test with various names and domains

### Example Test Cases

| Name | Domain | Expected Result |
|------|--------|-----------------|
| Steven Morris | apple.com | Should find email(s) |
| John Smith | example.com | May have multiple results |
| Invalid Name | invalid | Should handle gracefully |

## Production Deployment

When deploying to production:

1. Set the `CLEAROUT_API_TOKEN` environment variable in your hosting platform
2. Ensure the token has sufficient credits
3. Monitor API usage and rate limits
4. Consider implementing additional caching if needed

## Security Considerations

- ✅ API token stored in environment variables (not in code)
- ✅ Server-side API calls (token never exposed to client)
- ✅ Authentication required (Shopify admin auth)
- ✅ Input validation on both client and server
- ✅ Error messages don't expose sensitive information

## Future Enhancements

Potential improvements:

- Bulk email finding capability
- Email validation integration
- Results caching
- Export to CSV
- Integration with Shopify customer records
- Webhook notifications for queued results

## Support

For issues related to:
- **Clearout API**: Contact Clearout support at https://app.clearout.io/
- **Integration Issues**: Check the error logs and ensure proper configuration

## License

This integration is part of the Shopify app template and follows the same license.

