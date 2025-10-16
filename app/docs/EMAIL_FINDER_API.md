# Clearout Email Tools Integration

This document describes the Clearout Email Finder and Email Verify API integrations in the application.

## Overview

This application integrates two powerful Clearout APIs:

1. **Email Finder API**: Instantly discover email addresses by providing a person's name and their domain or company name
2. **Email Verify API**: Verify the validity and deliverability of email addresses with detailed analysis

The integration includes:

- TypeScript type definitions for both APIs
- Server-side API route handlers
- Frontend UI component with tabbed interface
- Comprehensive error handling for all error scenarios
- Real-time results display with detailed information

## Configuration

### Environment Variables

Add your Clearout API token to your `.env` file:

```env
CLEAROUT_API_TOKEN=your_api_token_here
```

Get your API token from: https://app.clearout.io/

### Type Definitions

TypeScript types are defined in `app/types/email-finder.ts`:

**Email Finder Types:**
- `EmailFinderRequest` - Request payload structure
- `EmailFinderResponse` - API response structure (union type)
- `EmailFinderData` - Successful response data
- `EmailResult` - Individual email result
- `EmailFinderSuccessResponse` - Success response
- `EmailFinderFailedResponse` - Failed response with error details
- `EmailFinderErrorResponse` - Internal error response

**Email Verify Types:**
- `EmailVerifyRequest` - Request payload structure
- `EmailVerifyResponse` - API response structure (union type)
- `EmailVerifyData` - Successful response data with verification details
- `EmailVerifySuccessResponse` - Success response
- `EmailVerifyFailedResponse` - Failed response with error details
- `EmailVerifyErrorResponse` - Internal error response

**Shared Types:**
- `ValidationError` - Validation error details (400 responses)
- `TimeoutAdditionalInfo` - Timeout/queue information (524 responses)
- `SubStatus` - Sub-status information for verify results
- `DetailInfo` - Detailed email information (account, domain, MX, provider)

## Usage

### Accessing the Features

1. Visit the landing page at the root route (`/`)
2. Choose between two tabs:
   - **📧 Email Finder**: Discover email addresses
   - **✅ Email Verify**: Verify email addresses

#### Email Finder Tab

Fill in the form with:
- **Name**: Full name of the person (e.g., "Steven Morris")
- **Domain**: Domain or company name (e.g., "apple.com")
- **Timeout** (optional): Request wait time in milliseconds (10,000-180,000)

#### Email Verify Tab

Fill in the form with:
- **Email Address**: The email to verify (e.g., "us@clearout.io")
- **Timeout** (optional): Request wait time in milliseconds (default: 130,000)

### API Endpoint

**Route**: `/` (root route)
**Method**: `POST`  
**Handler**: `app/routes/_index/route.tsx`

### Request Parameters

#### Email Finder

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name of the person |
| domain | string | Yes | Domain or company name |
| timeout | number | No | Wait time in ms (default: 30000) |

#### Email Verify

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email address to verify |
| timeout | number | No | Wait time in ms (default: 130000) |

### Response Structure

#### Email Finder Success Response

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

#### Email Verify Success Response

```json
{
  "status": "success",
  "data": {
    "ai_verdict": "Given email address is from Gsuite provider, sending message will be delivered without a bounce.",
    "email_address": "us@clearout.io",
    "safe_to_send": "yes",
    "status": "valid",
    "verified_on": "2019-05-02T18:12:53+05:30",
    "time_taken": 432,
    "sub_status": {
      "code": 200,
      "desc": "Success"
    },
    "detail_info": {
      "account": "us",
      "domain": "clearout.io",
      "mx_record": "aspmx.l.google.com",
      "smtp_provider": "gsuite"
    },
    "blacklist_info": [],
    "disposable": "no",
    "free": "no",
    "role": "yes",
    "gibberish": "no",
    "suggested_email_address": "",
    "profile": null,
    "bounce_type": ""
  }
}
```

#### Error Response (Internal)

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

#### Failed Response (API)

```json
{
  "status": "failed",
  "error": {
    "code": 1088,
    "message": "Error description"
  }
}
```

## Error Handling

The integration comprehensively handles all error scenarios from the Clearout API:

### Internal Errors

- **VALIDATION_ERROR**: Missing required fields (name or domain)
- **CONFIG_ERROR**: API token not configured in environment variables
- **NETWORK_ERROR**: Connection issues or request failures

### Clearout API Errors

#### Success (200)
- `status: "success"` - Email found successfully with confidence score and details

#### Failed Response (200 with status: "failed")
- **Code 1088**: Unsupported characters in name fields
- Other API-specific failures with error codes and messages

#### Bad Request (400)
- **Validation Failed**: Invalid or empty required fields
- Displays detailed validation errors showing:
  - Which field(s) failed validation
  - Specific error messages
  - Location of the error (body, query, etc.)

#### Unauthorized (401)
- **Code 1000**: Invalid API Token
- Indicates the need to generate a new token from the Clearout dashboard

#### Payment Required (402)
- **Code 1099**: Insufficient credits for instant email finder
- User needs to purchase more credits or upgrade their plan

#### Rate Limit Exceeded (429)
- API rate limit reached
- Error message includes when to retry
- Consider upgrading plan or contacting support@clearout.io

#### Timeout (524)
- Request timeout occurred
- **Queue Mode**: If `queue: true`, the email discovery continues in background
- Response includes:
  - `queue_id`: Use this to retrieve results later
  - Instructions to check "My Activities" in Clearout App
  - Resource information for tracking

### Error Display Features

The UI displays different error types appropriately:

1. **Validation Errors**: Shows each field error with specific messages
2. **Timeout Errors**: Displays queue ID and instructions for retrieving background results
3. **Credit/Payment Errors**: Clear message about insufficient credits
4. **Rate Limit Errors**: Shows when the user can retry
5. **General Errors**: User-friendly error messages with error codes

## UI Components

The frontend component (`app/routes/_index/route.tsx`) includes:

### Tabbed Interface

1. **📧 Email Finder Tab**
   - Input fields for name, domain, and timeout
   - Submit button with loading states

2. **✅ Email Verify Tab**
   - Input field for email address
   - Timeout configuration
   - Submit button with loading states

### Results Display

**Email Finder Results:**
- Email addresses (clickable mailto links)
- Role vs Personal email badges
- Business vs Non-Business badges
- Confidence score
- Company information
- Person's full name
- Domain and discovery date

**Email Verify Results:**
- 🤖 AI Verdict (highlighted section)
- Email validation status with icon (✅ safe, ⚠️ risky)
- Detailed email information:
  - Email address, account, domain
  - MX record and SMTP provider
  - Verification timestamp
  - Processing time
- Verification checks with color-coded badges:
  - ✓ Not Disposable / ⚠ Disposable
  - Business / Free Provider
  - Role Email / Personal Email
  - ✓ Valid Format / ⚠ Gibberish
- 💡 Suggested email (if applicable)

**Error Display:**
- User-friendly error messages
- Detailed validation errors (field-specific)
- Timeout information with queue ID
- Credit/payment error messages
- Rate limit information

## Features

### Email Finder
- ✅ Real-time email discovery
- ✅ Confidence scoring
- ✅ Role vs personal email detection
- ✅ Business email verification
- ✅ Multiple email results display
- ✅ Company information extraction

### Email Verify
- ✅ AI-powered email validation
- ✅ Deliverability assessment (safe to send)
- ✅ Disposable email detection
- ✅ Free vs business email identification
- ✅ Role email detection
- ✅ Gibberish/invalid format detection
- ✅ MX record and SMTP provider information
- ✅ Suggested email correction
- ✅ Blacklist checking
- ✅ Detailed verification metrics

### General Features
- ✅ Tabbed interface for easy switching between tools
- ✅ Loading states during API calls
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Real-time results display
- ✅ TypeScript type safety
- ✅ Responsive design
- ✅ Color-coded status badges

## API Reference

Full API documentation: https://docs.clearout.io/

### API Endpoints

- **Email Finder**: `https://api.clearout.io/v2/email_finder/instant`
- **Email Verify**: `https://api.clearout.io/v2/email_verify/instant`

### Rate Limits

Refer to your Clearout plan for rate limit information.

### Timeout Configuration

**Email Finder:**
- **Minimum**: 10,000 ms (10 seconds)
- **Maximum**: 180,000 ms (3 minutes)
- **Default**: 30,000 ms (30 seconds)

**Email Verify:**
- **Minimum**: 10,000 ms (10 seconds)
- **Maximum**: 180,000 ms (3 minutes)
- **Default**: 130,000 ms (130 seconds)

### Queue Mode

The Email Finder integration uses queue mode by default (`queue: true`), which means email discovery continues in the background even if the request times out. Results can be retrieved later from the Clearout dashboard using the provided `queue_id`.

## Development

### Testing

1. Ensure your API token is configured
2. Run the development server: `shopify app dev`
3. Navigate to the Email Finder page
4. Test with various names and domains

### Example Test Cases

**Email Finder:**
| Name | Domain | Expected Result |
|------|--------|-----------------|
| Steven Morris | apple.com | Should find email(s) |
| John Smith | example.com | May have multiple results |
| Invalid Name | invalid | Should handle gracefully |

**Email Verify:**
| Email | Expected Result |
|-------|-----------------|
| us@clearout.io | Valid business email |
| test@tempmail.com | Disposable email warning |
| invalid@nonexistent.xyz | Invalid/risky email |
| info@company.com | Valid role email |

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

- Bulk email finding and verification capability
- Results caching for frequently checked emails
- Export to CSV functionality
- Integration with Shopify customer records
- Webhook notifications for queued results
- Historical results tracking and analytics
- Combined workflow: Find → Verify → Store
- Email list management and organization

## Support

For issues related to:
- **Clearout API**: Contact Clearout support at https://app.clearout.io/
- **Integration Issues**: Check the error logs and ensure proper configuration

## License

This integration is part of the Shopify app template and follows the same license.

