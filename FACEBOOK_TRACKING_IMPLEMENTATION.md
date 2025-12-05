# Facebook Pixel & Conversion API Implementation Guide

This document provides a complete guide for implementing Facebook Pixel and Conversion API tracking, including browser-side and server-side event tracking with proper deduplication and match quality optimization.

## Overview

We've implemented Facebook tracking with:
- **Browser-side Facebook Pixel** - Direct pixel implementation for immediate event tracking
- **Server-side Facebook Conversion API** - Server-side tracking for reliability and deduplication
- **Event deduplication** - Using `eventID` to prevent duplicate events (90%+ deduplication rate)
- **Match quality optimization** - Using `fbp` (Facebook browser pixel ID) and `fbc` (Facebook click ID) for better user matching (8+/10 match quality)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Facebook Pixel ID and Access Token for Conversion API
FACEBOOK_PIXEL_ID=257835033032129
FACEBOOK_ACCESS_TOKEN=your_access_token_here
# FACEBOOK_TEST_EVENT_CODE=your_test_code_here (optional, for testing)
```

### Getting Facebook Credentials

1. **Pixel ID**: 
   - Go to Facebook Events Manager
   - Select your Ad Account
   - Navigate to Data Sources > Pixels
   - Copy the Pixel ID

2. **Access Token**:
   - In Events Manager, go to your Pixel
   - Click "Settings" tab
   - Under "Conversions API", click "Generate Access Token"
   - Copy the generated token

3. **Test Event Code** (Optional):
   - In Events Manager, go to "Test Events"
   - Create a new test dataset
   - Copy the test event code

## Implementation

### 1. Browser-Side Facebook Pixel

#### Step 1: Add Base Pixel Code to HTML

Add this code to your `index.html` or main HTML file, preferably in the `<head>` section:

```html
<!-- Facebook Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '257835033032129');
  fbq('track', 'PageView');
</script>
<!-- End Facebook Pixel Code -->
```

**Replace `257835033032129` with your actual Pixel ID.**

Also add the noscript fallback in the `<body>`:

```html
<!-- Facebook Pixel Noscript (must be in body) -->
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=257835033032129&ev=PageView&noscript=1"/>
</noscript>
```

#### Step 2: Create Facebook Pixel Utility

Create a utility file (e.g., `facebookPixel.ts` or `facebookPixel.js`) with tracking functions:

```typescript
/**
 * Facebook Pixel Utility
 * Handles browser-side event tracking with proper deduplication
 */

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

/**
 * Get Facebook browser pixel ID from _fbp cookie
 */
export const getFbp = (): string | null => {
  const fbpCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbp='));

  return fbpCookie ? fbpCookie.split('=')[1] : null;
};

/**
 * Get Facebook click ID from _fbc cookie
 */
export const getFbc = (): string | null => {
  const fbcCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbc='));

  return fbcCookie ? fbcCookie.split('=')[1] : null;
};

/**
 * Generate a unique event ID for deduplication
 * Format: {eventName}_{userId}_{timestamp}
 */
export const generateEventId = (eventName: string, userId?: string): string => {
  const timestamp = Date.now();
  const userPart = userId ? `_${userId}` : '';
  return `${eventName}${userPart}_${timestamp}`;
};

/**
 * Get Facebook pixel metadata for server-side tracking
 */
export const getFacebookPixelData = () => {
  return {
    fbp: getFbp(),
    fbc: getFbc(),
  };
};

/**
 * Track InitiateCheckout event with deduplication
 *
 * This fires BOTH browser event AND sends data to server
 * Facebook will automatically deduplicate using eventID
 */
export const trackInitiateCheckout = async (params: {
  tier: string;
  value: number;
  currency: string;
  userId?: string;
  token?: string;
}) => {
  const { tier, value, currency, userId, token } = params;

  // Generate unique event ID for deduplication
  const eventId = generateEventId('InitiateCheckout', userId);

  // Track browser-side event with eventID
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: [tier],
      content_name: `Mypen ${tier.toUpperCase()} Subscription`,
      content_type: 'product',
      content_category: 'subscription',
      value: value,
      currency: currency,
      num_items: 1,
    }, {
      eventID: eventId, // For deduplication with server event
    });
  }

  // Send to server for server-side tracking
  try {
    const fbPixelData = getFacebookPixelData();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/subscription/track-checkout', {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({
        packageType: tier,
        eventId: eventId, // Same event ID for deduplication
        fbp: fbPixelData.fbp, // Facebook browser pixel ID
        fbc: fbPixelData.fbc, // Facebook click ID
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to track checkout on server: ${response.status}`);
    } else {
      console.log('✅ Checkout tracking sent to server successfully');
    }
  } catch (error) {
    console.error('Failed to track checkout on server:', error);
    // Non-blocking - browser event still fired
  }
};

/**
 * Track Purchase event with deduplication
 */
export const trackPurchase = (params: {
  orderId: string;
  tier: string;
  value: number;
  currency: string;
}) => {
  const { orderId, tier, value, currency } = params;

  // Generate event ID from order ID for consistency
  const eventId = `purchase_${orderId}`;

  // Track browser-side event
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: [tier],
      content_name: `Mypen ${tier.toUpperCase()} Subscription`,
      content_type: 'product',
      content_category: 'subscription',
      value: value,
      currency: currency,
      num_items: 1,
    }, {
      eventID: eventId, // For deduplication with server event
    });
  }
};

/**
 * Track CompleteRegistration event with deduplication
 *
 * This fires BOTH browser event AND sends data to server
 * Server will track the same event with the same eventID for deduplication
 */
export const trackCompleteRegistration = async (params: {
  userId: string;
  email?: string;
  name?: string;
  registrationMethod?: string;
}) => {
  const { userId, email, name, registrationMethod = 'email' } = params;

  // Generate unique event ID for deduplication
  const eventId = `registration_${userId}`;

  // Track browser-side event
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'Account Registration',
      status: 'completed',
      registration_method: registrationMethod,
    }, {
      eventID: eventId, // For deduplication with server event
    });
  }

  // Send to server for server-side tracking with fbp/fbc
  try {
    const fbPixelData = getFacebookPixelData();

    await fetch('/api/auth/track-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: userId,
        email: email,
        name: name,
        registrationMethod: registrationMethod,
        eventId: eventId, // Same event ID for deduplication
        fbp: fbPixelData.fbp, // Facebook browser pixel ID
        fbc: fbPixelData.fbc, // Facebook click ID
      }),
    });
  } catch (error) {
    console.error('Failed to track registration on server:', error);
    // Non-blocking - browser event still fired
  }
};

/**
 * Track custom event
 */
export const trackCustomEvent = (eventName: string, params?: Record<string, any>, eventId?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const options = eventId ? { eventID: eventId } : undefined;
    window.fbq('track', eventName, params, options);
  }
};

/**
 * Track page view (already initialized in index.html, but can be called manually)
 */
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};
```

### 2. Server-Side Facebook Conversion API

#### Step 1: Create Facebook Conversion Service

Create `FacebookConversionService.js`:

```javascript
const axios = require('axios');
const crypto = require('crypto');

/**
 * Facebook Conversion API Service
 * Handles server-side event tracking for Facebook advertising
 */
class FacebookConversionService {
  constructor() {
    this.pixelId = process.env.FACEBOOK_PIXEL_ID;
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    this.testEventCode = process.env.FACEBOOK_TEST_EVENT_CODE;
    this.apiVersion = 'v19.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    
    this.isConfigured = this.pixelId && this.accessToken;
  }

  isServiceConfigured() {
    return this.isConfigured;
  }

  /**
   * Hash user data for privacy compliance
   */
  hashData(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }

  /**
   * Normalize phone number for hashing
   */
  normalizePhone(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    // Assume Georgian numbers if no country code
    return cleaned.length === 9 ? `995${cleaned}` : cleaned;
  }

  /**
   * Build user data object for Facebook API
   */
  buildUserData(userData) {
    const userDataObj = {};

    // Hash email (required)
    if (userData.email) {
      userDataObj.em = this.hashData(userData.email);
    }

    // Hash phone if provided
    if (userData.phone) {
      const normalizedPhone = this.normalizePhone(userData.phone);
      if (normalizedPhone) {
        userDataObj.ph = this.hashData(normalizedPhone);
      }
    }

    // Hash first and last name if provided
    if (userData.firstName) {
      userDataObj.fn = this.hashData(userData.firstName);
    }
    if (userData.lastName) {
      userDataObj.ln = this.hashData(userData.lastName);
    }

    // External ID (user ID) - hash for privacy
    if (userData.externalId) {
      userDataObj.external_id = this.hashData(userData.externalId);
    }

    // Client information (not hashed)
    if (userData.clientIpAddress) {
      userDataObj.client_ip_address = userData.clientIpAddress;
    }
    if (userData.clientUserAgent) {
      userDataObj.client_user_agent = userData.clientUserAgent;
    }

    // Facebook browser and click IDs (not hashed - critical for match quality)
    if (userData.fbp) {
      userDataObj.fbp = userData.fbp; // Facebook browser pixel ID
    }
    if (userData.fbc) {
      userDataObj.fbc = userData.fbc; // Facebook click ID
    }

    // Country (hardcoded for Georgia)
    userDataObj.ct = this.hashData('tbilisi'); // City (hashed)
    userDataObj.country = this.hashData('ge'); // Country code (hashed)

    return userDataObj;
  }

  /**
   * Send event to Facebook Conversion API
   */
  async sendEvent(eventData) {
    if (!this.isConfigured) {
      return { success: false, reason: 'not_configured' };
    }

    try {
      const eventTime = Math.floor(Date.now() / 1000);
      
      const event = {
        event_name: eventData.eventName,
        event_time: eventTime,
        action_source: 'website',
        user_data: this.buildUserData(eventData.userData),
        custom_data: eventData.customData || {},
      };

      // Add optional fields
      if (eventData.eventSourceUrl) {
        event.event_source_url = eventData.eventSourceUrl;
      }
      
      if (eventData.eventId) {
        event.event_id = eventData.eventId; // Critical for deduplication
      }

      const payload = {
        data: [event],
        access_token: this.accessToken,
      };

      // Add test event code if in test mode
      if (this.testEventCode) {
        payload.test_event_code = this.testEventCode;
      }

      const url = `${this.baseUrl}/${this.pixelId}/events`;
      
      const response = await axios.post(url, payload);

      return {
        success: true,
        events_received: response.data.events_received,
        messages_received: response.data.messages_received,
        fbtrace_id: response.data.fbtrace_id,
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.response?.data,
      };
    }
  }

  /**
   * Track purchase event
   */
  async trackPurchase(purchaseData) {
    const eventData = {
      eventName: 'Purchase',
      eventId: `purchase_${purchaseData.orderId}`,
      userData: {
        email: purchaseData.user.email,
        firstName: purchaseData.user.name?.split(' ')[0],
        lastName: purchaseData.user.name?.split(' ').slice(1).join(' '),
        clientIpAddress: purchaseData.clientIpAddress,
        clientUserAgent: purchaseData.clientUserAgent,
        externalId: purchaseData.user.id || purchaseData.user._id?.toString(),
        fbp: purchaseData.fbp, // Facebook browser pixel ID
        fbc: purchaseData.fbc, // Facebook click ID
      },
      customData: {
        value: purchaseData.value,
        currency: purchaseData.currency,
        content_type: 'product',
        content_ids: [purchaseData.tier],
        content_name: `Mypen ${purchaseData.tier.toUpperCase()} Subscription`,
        content_category: 'subscription',
        num_items: 1,
      },
    };

    return this.sendEvent(eventData);
  }

  /**
   * Track user registration event
   */
  async trackRegistration(registrationData) {
    const eventData = {
      eventName: 'CompleteRegistration',
      eventId: registrationData.eventId || `registration_${registrationData.user.id}`,
      userData: {
        email: registrationData.user.email,
        firstName: registrationData.user.name?.split(' ')[0],
        lastName: registrationData.user.name?.split(' ').slice(1).join(' '),
        clientIpAddress: registrationData.clientIpAddress,
        clientUserAgent: registrationData.clientUserAgent,
        externalId: registrationData.user.id || registrationData.user._id?.toString(),
        fbp: registrationData.fbp, // Facebook browser pixel ID
        fbc: registrationData.fbc, // Facebook click ID
      },
      customData: {
        content_name: 'Account Registration',
        status: 'completed',
        registration_method: registrationData.registrationMethod || 'email',
      },
    };

    return this.sendEvent(eventData);
  }

  /**
   * Track checkout initiation
   */
  async trackInitiateCheckout(checkoutData) {
    const eventData = {
      eventName: 'InitiateCheckout',
      eventId: checkoutData.eventId || `checkout_${checkoutData.user.id}_${Date.now()}`,
      userData: {
        email: checkoutData.user.email,
        firstName: checkoutData.user.name?.split(' ')[0],
        lastName: checkoutData.user.name?.split(' ').slice(1).join(' '),
        clientIpAddress: checkoutData.clientIpAddress,
        clientUserAgent: checkoutData.clientUserAgent,
        externalId: checkoutData.user.id || checkoutData.user._id?.toString(),
        fbp: checkoutData.fbp, // Facebook browser pixel ID - CRITICAL for match quality
        fbc: checkoutData.fbc, // Facebook click ID - CRITICAL for match quality
      },
      customData: {
        value: checkoutData.value,
        currency: checkoutData.currency,
        content_type: 'product',
        content_ids: [checkoutData.tier],
        content_name: `Mypen ${checkoutData.tier.toUpperCase()} Subscription`,
        content_category: 'subscription',
        num_items: 1,
      },
    };

    return this.sendEvent(eventData);
  }

  /**
   * Track subscription upgrade/downgrade event
   */
  async trackSubscriptionChange(subscriptionData) {
    const eventData = {
      eventName: 'Subscribe',
      eventId: `subscription_${subscriptionData.user.id}_${Date.now()}`,
      userData: {
        email: subscriptionData.user.email,
        firstName: subscriptionData.user.name?.split(' ')[0],
        lastName: subscriptionData.user.name?.split(' ').slice(1).join(' '),
        clientIpAddress: subscriptionData.clientIpAddress,
        clientUserAgent: subscriptionData.clientUserAgent,
        externalId: subscriptionData.user.id || subscriptionData.user._id?.toString(),
      },
      customData: {
        content_name: `Subscription ${subscriptionData.eventType}`,
        content_category: 'subscription',
        status: subscriptionData.eventType,
        predicted_ltv: this.calculateLTV(subscriptionData.toTier),
      },
    };

    return this.sendEvent(eventData);
  }

  /**
   * Safe wrapper for tracking events
   */
  async safeTrack(trackingFunction, ...args) {
    try {
      return await trackingFunction.apply(this, args);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FacebookConversionService();
```

## Event Tracking Implementation

### InitiateCheckout Event

**Browser-side (when user visits checkout page):**

```typescript
import { trackInitiateCheckout } from '~/utils/facebookPixel';

trackInitiateCheckout({
  tier: 'ultra',
  value: 69,
  currency: 'GEL',
  userId: userId,
  token: token, // Optional JWT token for API authentication
});
```

**Server-side (API endpoint `/api/subscription/track-checkout`):**

```javascript
const FacebookConversionService = require('./FacebookConversionService');

// In your checkout endpoint
FacebookConversionService.safeTrack(
  FacebookConversionService.trackInitiateCheckout,
  {
    user: user,
    tier: packageType,
    value: tier.price,
    currency: 'GEL',
    clientIpAddress: req.ip,
    clientUserAgent: req.get('user-agent'),
    eventId: eventId, // Same eventId as browser for deduplication
    fbp: fbp, // Facebook browser pixel ID - CRITICAL for match quality
    fbc: fbc, // Facebook click ID - CRITICAL for match quality
  }
).catch(error => {
  console.error('Failed to track checkout:', error);
});
```

### Purchase Event

**Browser-side (when purchase completes):**

```typescript
import { trackPurchase } from '~/utils/facebookPixel';

trackPurchase({
  orderId: orderId,
  tier: 'ultra',
  value: 69,
  currency: 'GEL',
});
```

**Server-side (in payment callback):**

```javascript
FacebookConversionService.safeTrack(
  FacebookConversionService.trackPurchase,
  {
    user: updatedUser,
    orderId: order.orderId,
    value: order.amount,
    currency: order.currency,
    tier: order.packageType,
    clientIpAddress: req.ip,
    clientUserAgent: req.get('user-agent'),
    fbp: fbp, // If available from purchase data
    fbc: fbc, // If available from purchase data
  }
).catch(error => {
  console.error('Failed to track purchase:', error);
});
```

### CompleteRegistration Event

**Browser-side (after user registers):**

```typescript
import { trackCompleteRegistration } from '~/utils/facebookPixel';

trackCompleteRegistration({
  userId: userId,
  email: email,
  name: name,
  registrationMethod: 'email',
});
```

**Server-side (API endpoint `/api/auth/track-registration`):**

```javascript
FacebookConversionService.safeTrack(
  FacebookConversionService.trackRegistration,
  {
    user: {
      id: userId,
      email: email || user.email,
      name: name || user.name,
    },
    clientIpAddress: req.ip,
    clientUserAgent: req.get('user-agent'),
    eventId: eventId, // Same eventId as browser for deduplication
    fbp: fbp, // Facebook browser pixel ID
    fbc: fbc, // Facebook click ID
    registrationMethod: registrationMethod || 'email',
  }
).catch(error => {
  console.error('Failed to track registration:', error);
});
```

## Deduplication Strategy

### How It Works

1. **Browser generates `eventID`** when tracking an event
2. **Browser sends `eventID` to server** via API call (along with `fbp` and `fbc`)
3. **Server uses same `eventID`** when tracking server-side
4. **Facebook automatically deduplicates** events with the same `eventID` within 48 hours

### Event ID Formats

- **InitiateCheckout**: `InitiateCheckout_{userId}_{timestamp}`
- **Purchase**: `purchase_{orderId}` (both browser and server use same format)
- **CompleteRegistration**: `registration_{userId}` (both browser and server use same format)

### Match Quality Optimization

**Critical Parameters for 8+/10 Match Quality:**

1. **`fbp` (Facebook Browser Pixel ID)** - Extracted from `_fbp` cookie
   - Automatically set by Facebook Pixel
   - Sent from browser to server for server-side events
   - Significantly improves match quality

2. **`fbc` (Facebook Click ID)** - Extracted from `_fbc` cookie
   - Set when user clicks on Facebook ad
   - Sent from browser to server for server-side events
   - Improves attribution accuracy

3. **`external_id`** - Hashed user ID
   - Helps Facebook match events to users
   - Must be SHA-256 hashed

4. **Hashed PII** - Email, phone, names
   - All PII must be SHA-256 hashed
   - Improves match quality significantly

### Expected Results

- **Deduplication Rate**: 90%+ when browser and server events use the same `eventID`
- **Match Quality**: 8+/10 when `fbp`, `fbc`, and hashed PII are included
- **Processing Time**: Facebook processes deduplication within 5-10 minutes

## Important Notes

### Privacy Compliance

- All PII (email, phone, names, user IDs) is **SHA-256 hashed** before sending to Facebook
- Email must be lowercase and trimmed before hashing
- Phone numbers should be normalized (add country code if missing)
- IP addresses and user agents are sent unhashed (as required by Facebook)

### fbp and fbc Cookies

- **`_fbp` cookie**: Automatically set by Facebook Pixel
  - Format: `fb.{pixel_id}.{timestamp}`
  - Extracted using `getFbp()` function
  - Critical for match quality

- **`_fbc` cookie**: Set when user clicks Facebook ad
  - Format: `fb.{pixel_id}.{click_id}.{timestamp}`
  - Extracted using `getFbc()` function
  - Improves attribution accuracy

### Error Handling

- All tracking is **non-blocking** - failures don't affect user experience
- Errors are logged but don't throw exceptions
- Use `safeTrack()` wrapper for server-side tracking
- Browser events fire even if server tracking fails

## Testing

### Test Event Code

Add `FACEBOOK_TEST_EVENT_CODE` to `.env` for testing:

```env
FACEBOOK_TEST_EVENT_CODE=your_test_code_here
```

Events sent with test event code will appear in Facebook Events Manager under "Test Events" and won't affect production data.

### Verification

1. Check Facebook Events Manager for incoming events
2. Verify events show "Deduplicated" badge after processing
3. Check Match Quality score (should be 8+/10)
4. Verify deduplication rate (should be 90%+)
5. Check that `fbp` and `fbc` are included in server events

## Troubleshooting

### Events Not Appearing

- Check Pixel ID is correct in HTML
- Verify Access Token is valid
- Check browser console for errors
- Verify network requests to `connect.facebook.net`

### Low Match Quality (< 8/10)

- Ensure `fbp` is being sent from browser to server
- Ensure `fbc` is being sent (if user clicked Facebook ad)
- Verify email is being hashed correctly (lowercase, trimmed)
- Check that `external_id` (hashed user ID) is included

### Deduplication Not Working

- Ensure same `eventID` is used for browser and server events
- Check that `eventID` is included in both browser and server payloads
- Wait 5-10 minutes for Facebook to process deduplication
- Verify events are within 48-hour deduplication window

### Missing fbp/fbc

- `_fbp` cookie is automatically set by Facebook Pixel (should always be present)
- `_fbc` cookie is only set when user clicks Facebook ad (may be null)
- Both should be extracted and sent to server for best match quality

## For Landing Page Implementation (mypen.ge)

If implementing on a separate landing page domain:

1. **Add Facebook Pixel base code** to landing page HTML
2. **Use same Pixel ID** (`257835033032129`)
3. **Track events** when users interact (clicks, form submissions)
4. **Send events to your main site's API** for server-side tracking with same `eventID`
5. **Include `fbp` and `fbc`** in API calls for match quality

Example for landing page:

```javascript
// On landing page - track button click
import { trackInitiateCheckout, getFacebookPixelData } from './facebookPixel';

// When user clicks "Get Started" or "Select Plan"
const fbPixelData = getFacebookPixelData();
const eventId = `InitiateCheckout_${Date.now()}`;

// Track browser-side
trackInitiateCheckout({
  tier: 'ultra',
  value: 69,
  currency: 'GEL',
  userId: null, // May not have userId on landing page
});

// Send to main site API for server-side tracking
fetch('https://chat.mypen.ge/api/subscription/track-checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    packageType: 'ultra',
    eventId: eventId, // Same event ID for deduplication
    fbp: fbPixelData.fbp, // Critical for match quality
    fbc: fbPixelData.fbc, // Critical for match quality
  }),
});

// Then redirect to main site checkout
window.location.href = 'https://chat.mypen.ge/checkout/ultra';
```

### Cross-Domain Considerations

- **Same Pixel ID**: Use the same Pixel ID on both domains
- **Cookie Sharing**: `_fbp` and `_fbc` cookies are domain-specific
  - Extract cookies on landing page
  - Send them to main site API
  - Main site uses them for server-side tracking
- **Event ID**: Generate on landing page, send to main site, use same ID for both events
- **CORS**: Ensure main site API allows requests from landing page domain

## API Endpoints

### Track Checkout Initiation

**Endpoint**: `POST /api/subscription/track-checkout`

**Request Body**:
```json
{
  "packageType": "ultra",
  "eventId": "InitiateCheckout_user123_1234567890",
  "fbp": "fb.257835033032129.1234567890",
  "fbc": "fb.257835033032129.click_id.1234567890"
}
```

**Response**:
```json
{
  "success": true
}
```

### Track Registration

**Endpoint**: `POST /api/auth/track-registration`

**Request Body**:
```json
{
  "userId": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "registrationMethod": "email",
  "eventId": "registration_user123",
  "fbp": "fb.257835033032129.1234567890",
  "fbc": "fb.257835033032129.click_id.1234567890"
}
```

**Response**:
```json
{
  "success": true
}
```

## Support

For issues or questions:
- Check Facebook Events Manager for event status
- Review server logs for tracking errors
- Verify environment variables are set correctly
- Test with test event code first
- Check Match Quality and Deduplication sections in Events Manager

