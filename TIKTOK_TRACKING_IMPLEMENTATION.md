# TikTok Pixel & Events API Implementation Guide

This document provides a complete guide for implementing TikTok Pixel and Events API tracking, including browser-side and server-side event tracking with proper deduplication.

## Overview

We've implemented TikTok tracking with:
- **Browser-side TikTok Pixel** - Direct pixel implementation for immediate event tracking
- **Server-side TikTok Events API** - Server-side tracking for reliability and deduplication
- **Event deduplication** - Using `event_id` to prevent duplicate events
- **Currency normalization** - Converting currency symbols to ISO codes (₾ → GEL)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# TikTok Pixel ID and Access Token for Events API
TIKTOK_PIXEL_ID=D4KM9EJC77UEBGID26JG
TIKTOK_ACCESS_TOKEN=2d4cf5e36e762d83bf3b59df0bea0abe0f356f9a
# TIKTOK_TEST_EVENT_CODE=your_test_code_here (optional, for testing)
```

### Getting TikTok Credentials

1. **Pixel ID**: 
   - Go to TikTok Events Manager
   - Select your Ad Account
   - Navigate to Assets > Events
   - Copy the Pixel ID

2. **Access Token**:
   - In Events Manager, go to Assets > Events
   - Click on your Pixel
   - Go to "Settings" tab
   - Under "Events API", click "Generate Access Token"
   - Copy the generated token

3. **Test Event Code** (Optional):
   - In Events Manager, go to "Test Events"
   - Create a new test dataset
   - Copy the test event code

## Implementation

### 1. Browser-Side TikTok Pixel

#### Step 1: Add Base Pixel Code to HTML

Add this code to your `index.html` or main HTML file, preferably in the `<head>` section:

```html
<!-- TikTok Pixel Code Start -->
<script>
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
    var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
    ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

    ttq.load('D4KM9EJC77UEBGID26JG');
    ttq.page();
  }(window, document, 'ttq');
</script>
<!-- TikTok Pixel Code End -->
```

**Replace `D4KM9EJC77UEBGID26JG` with your actual Pixel ID.**

#### Step 2: Create TikTok Pixel Utility

Create a utility file (e.g., `tiktokPixel.ts` or `tiktokPixel.js`) with tracking functions:

```typescript
/**
 * TikTok Pixel Utility
 * Handles browser-side event tracking for TikTok advertising
 */

declare global {
  interface Window {
    ttq: {
      track: (event: string, data?: Record<string, any>) => void;
      page: () => void;
      identify: (data?: Record<string, any>) => void;
      instance: (pixelId: string) => any;
    };
  }
}

/**
 * Get TikTok Pixel instance
 * @param pixelId - TikTok Pixel ID (default: 'D4KM9EJC77UEBGID26JG')
 */
const getTikTokInstance = (pixelId: string = 'D4KM9EJC77UEBGID26JG') => {
  if (typeof window === 'undefined' || !window.ttq) {
    return null;
  }
  return window.ttq.instance ? window.ttq.instance(pixelId) : window.ttq;
};

/**
 * Normalize currency code to ISO format
 * TikTok Events API requires ISO 4217 currency codes (e.g., "GEL" not "₾")
 */
const normalizeCurrency = (currency: string): string => {
  if (!currency) return 'GEL'; // Default to GEL
  
  const currencyMap: Record<string, string> = {
    '₾': 'GEL',
    'GEL': 'GEL',
    'USD': 'USD',
    'EUR': 'EUR',
    'GBP': 'GBP',
  };
  
  const normalized = currency.trim().toUpperCase();
  return currencyMap[normalized] || currencyMap[currency] || 'GEL';
};

/**
 * Generate a unique event ID for deduplication
 * Format: {eventName}_{userId}_{timestamp}
 */
const generateEventId = (eventName: string, userId?: string): string => {
  const timestamp = Date.now();
  const userPart = userId ? `_${userId}` : '';
  return `${eventName}${userPart}_${timestamp}`;
};

/**
 * Track InitiateCheckout event
 * Fires when user clicks "Select Plan" or visits checkout page
 */
export const trackInitiateCheckout = (params: {
  tier: string;
  value: number;
  currency: string;
  userId?: string;
  eventId?: string;
}) => {
  const { tier, value, currency, userId, eventId } = params;
  const instance = getTikTokInstance();

  if (!instance) {
    console.warn('TikTok Pixel not loaded');
    return;
  }

  try {
    const normalizedCurrency = normalizeCurrency(currency);
    const finalEventId = eventId || generateEventId('InitiateCheckout', userId);
    
    instance.track('InitiateCheckout', {
      content_type: 'product',
      content_id: tier,
      content_name: `Mypen ${tier.toUpperCase()} Subscription`,
      content_category: 'subscription',
      value: value,
      currency: normalizedCurrency,
      quantity: 1,
      event_id: finalEventId, // For deduplication with server event
    });
    console.log('✅ TikTok InitiateCheckout tracked:', { tier, value, currency: normalizedCurrency, eventId: finalEventId });
  } catch (error) {
    console.error('Failed to track TikTok InitiateCheckout:', error);
  }
};

/**
 * Track Purchase event
 * Fires when purchase completes successfully
 */
export const trackPurchase = (params: {
  orderId: string;
  tier: string;
  value: number;
  currency: string;
  eventId?: string;
}) => {
  const { orderId, tier, value, currency, eventId } = params;
  const instance = getTikTokInstance();

  if (!instance) {
    console.warn('TikTok Pixel not loaded');
    return;
  }

  try {
    const normalizedCurrency = normalizeCurrency(currency);
    // Use orderId as eventId for deduplication (same as server-side)
    const finalEventId = eventId || `purchase_${orderId}`;
    
    instance.track('CompletePayment', {
      content_type: 'product',
      content_id: tier,
      content_name: `Mypen ${tier.toUpperCase()} Subscription`,
      content_category: 'subscription',
      value: value,
      currency: normalizedCurrency,
      quantity: 1,
      order_id: orderId,
      event_id: finalEventId, // For deduplication with server event
    });
    console.log('✅ TikTok Purchase tracked:', { orderId, tier, value, currency: normalizedCurrency, eventId: finalEventId });
  } catch (error) {
    console.error('Failed to track TikTok Purchase:', error);
  }
};

/**
 * Track CompleteRegistration event
 * Fires when user completes registration
 */
export const trackCompleteRegistration = (params: {
  userId: string;
  email?: string;
  name?: string;
  registrationMethod?: string;
  eventId?: string;
}) => {
  const { userId, registrationMethod = 'email', eventId } = params;
  const instance = getTikTokInstance();

  if (!instance) {
    console.warn('TikTok Pixel not loaded');
    return;
  }

  try {
    const finalEventId = eventId || `registration_${userId}`;
    
    instance.track('CompleteRegistration', {
      content_name: 'Account Registration',
      status: 'completed',
      registration_method: registrationMethod,
      event_id: finalEventId, // For deduplication with server event
    });

    // Optionally identify the user for better tracking
    if (userId && instance.identify) {
      instance.identify({
        external_id: userId,
      });
    }

    console.log('✅ TikTok CompleteRegistration tracked:', { userId, registrationMethod, eventId: finalEventId });
  } catch (error) {
    console.error('Failed to track TikTok CompleteRegistration:', error);
  }
};

/**
 * Track subscription change event (upgrade/downgrade)
 */
export const trackSubscriptionChange = (params: {
  fromTier: string;
  toTier: string;
  eventType: 'upgrade' | 'downgrade';
  value?: number;
  currency?: string;
}) => {
  const { fromTier, toTier, eventType, value, currency } = params;
  const instance = getTikTokInstance();

  if (!instance) {
    console.warn('TikTok Pixel not loaded');
    return;
  }

  try {
    const normalizedCurrency = currency ? normalizeCurrency(currency) : undefined;
    instance.track('Subscribe', {
      content_type: 'product',
      content_id: toTier,
      content_name: `Mypen ${toTier.toUpperCase()} Subscription`,
      content_category: 'subscription',
      status: eventType,
      ...(value && { value }),
      ...(normalizedCurrency && { currency: normalizedCurrency }),
    });
    console.log('✅ TikTok Subscribe tracked:', { fromTier, toTier, eventType });
  } catch (error) {
    console.error('Failed to track TikTok Subscribe:', error);
  }
};

/**
 * Track page view (already initialized in index.html, but can be called manually)
 */
export const trackPageView = () => {
  const instance = getTikTokInstance();
  if (instance && instance.page) {
    try {
      instance.page();
    } catch (error) {
      console.error('Failed to track TikTok PageView:', error);
    }
  }
};
```

### 2. Server-Side TikTok Events API

#### Step 1: Create TikTok Conversion Service

Create `TikTokConversionService.js`:

```javascript
const axios = require('axios');
const crypto = require('crypto');

/**
 * TikTok Events API Service
 * Handles server-side event tracking for TikTok advertising
 */
class TikTokConversionService {
  constructor() {
    this.pixelId = process.env.TIKTOK_PIXEL_ID || 'D4KM9EJC77UEBGID26JG';
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN || '2d4cf5e36e762d83bf3b59df0bea0abe0f356f9a';
    this.testEventCode = process.env.TIKTOK_TEST_EVENT_CODE;
    this.apiVersion = 'v1.3';
    this.baseUrl = 'https://business-api.tiktok.com/open_api';
    
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
   * Normalize currency code to ISO format
   */
  normalizeCurrency(currency) {
    if (!currency) return 'GEL';
    
    const currencyMap = {
      '₾': 'GEL',
      'GEL': 'GEL',
      'USD': 'USD',
      'EUR': 'EUR',
      'GBP': 'GBP',
    };
    
    const normalized = currency.trim().toUpperCase();
    return currencyMap[normalized] || currencyMap[currency] || 'GEL';
  }

  /**
   * Build user data object for TikTok API
   */
  buildUserData(userData) {
    const userDataObj = {};

    if (userData.email) {
      userDataObj.email = this.hashData(userData.email);
    }

    if (userData.phone) {
      const cleaned = userData.phone.replace(/\D/g, '');
      const normalizedPhone = cleaned.length === 9 ? `995${cleaned}` : cleaned;
      if (normalizedPhone) {
        userDataObj.phone_number = this.hashData(normalizedPhone);
      }
    }

    if (userData.firstName) {
      userDataObj.first_name = this.hashData(userData.firstName);
    }
    if (userData.lastName) {
      userDataObj.last_name = this.hashData(userData.lastName);
    }

    if (userData.externalId) {
      userDataObj.external_id = this.hashData(userData.externalId);
    }

    if (userData.clientIpAddress) {
      userDataObj.ip = userData.clientIpAddress;
    }
    if (userData.clientUserAgent) {
      userDataObj.user_agent = userData.clientUserAgent;
    }

    return userDataObj;
  }

  /**
   * Build properties object for TikTok event
   */
  buildProperties(customData) {
    const properties = {};

    if (customData.value !== undefined) {
      properties.value = customData.value;
    }

    if (customData.currency) {
      properties.currency = this.normalizeCurrency(customData.currency);
    }

    if (customData.content_ids && Array.isArray(customData.content_ids)) {
      properties.content_id = customData.content_ids[0];
    }

    if (customData.content_name) {
      properties.content_name = customData.content_name;
    }

    if (customData.content_type) {
      properties.content_type = customData.content_type;
    }

    if (customData.content_category) {
      properties.content_category = customData.content_category;
    }

    if (customData.num_items !== undefined) {
      properties.quantity = customData.num_items;
    }

    return properties;
  }

  /**
   * Send event to TikTok Events API
   */
  async sendEvent(eventData) {
    if (!this.isConfigured) {
      return { success: false, reason: 'not_configured' };
    }

    try {
      const eventTime = Math.floor(Date.now() / 1000);
      
      const event = {
        event: eventData.eventName,
        timestamp: eventTime.toString(),
        properties: this.buildProperties(eventData.customData || {}),
        context: {
          user: this.buildUserData(eventData.userData),
          page: {
            url: eventData.eventSourceUrl || 'https://chat.mypen.ge',
          },
        },
      };

      if (eventData.eventId) {
        event.event_id = eventData.eventId;
      }

      const payload = {
        pixel_code: this.pixelId,
        data: [event],
      };

      if (this.testEventCode) {
        payload.test_event_code = this.testEventCode;
      }

      const url = `${this.baseUrl}/${this.apiVersion}/event/track/`;
      
      const response = await axios.post(url, payload, {
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: response.data.code === 0,
        code: response.data.code,
        message: response.data.message,
        request_id: response.data.request_id,
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
      eventName: 'CompletePayment',
      eventId: `purchase_${purchaseData.orderId}`,
      userData: {
        email: purchaseData.user.email,
        firstName: purchaseData.user.name?.split(' ')[0],
        lastName: purchaseData.user.name?.split(' ').slice(1).join(' '),
        clientIpAddress: purchaseData.clientIpAddress,
        clientUserAgent: purchaseData.clientUserAgent,
        externalId: purchaseData.user.id || purchaseData.user._id?.toString(),
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

module.exports = new TikTokConversionService();
```

## Event Tracking Implementation

### InitiateCheckout Event

**Browser-side (when user visits checkout page):**

```typescript
import { trackInitiateCheckout } from '~/utils/tiktokPixel';

// Generate eventId for deduplication
const eventId = `InitiateCheckout_${userId}_${Date.now()}`;

trackInitiateCheckout({
  tier: 'ultra',
  value: 69,
  currency: '₾', // Will be normalized to 'GEL'
  userId: userId,
  eventId: eventId, // For deduplication with server event
});
```

**Server-side (API endpoint):**

```javascript
const TikTokConversionService = require('./TikTokConversionService');

// In your checkout endpoint
TikTokConversionService.safeTrack(
  TikTokConversionService.trackInitiateCheckout,
  {
    user: user,
    tier: packageType,
    value: tier.price,
    currency: 'GEL',
    clientIpAddress: req.ip,
    clientUserAgent: req.get('user-agent'),
    eventId: eventId, // Same eventId as browser for deduplication
  }
).catch(error => {
  console.error('Failed to track checkout:', error);
});
```

### Purchase Event

**Browser-side (when purchase completes):**

```typescript
import { trackPurchase } from '~/utils/tiktokPixel';

trackPurchase({
  orderId: orderId,
  tier: 'ultra',
  value: 69,
  currency: '₾', // Will be normalized to 'GEL'
  eventId: `purchase_${orderId}`, // Same as server for deduplication
});
```

**Server-side (in payment callback):**

```javascript
TikTokConversionService.safeTrack(
  TikTokConversionService.trackPurchase,
  {
    user: updatedUser,
    orderId: order.orderId,
    value: order.amount,
    currency: order.currency,
    tier: order.packageType,
    clientIpAddress: req.ip,
    clientUserAgent: req.get('user-agent'),
  }
).catch(error => {
  console.error('Failed to track purchase:', error);
});
```

### CompleteRegistration Event

**Browser-side (after user registers):**

```typescript
import { trackCompleteRegistration } from '~/utils/tiktokPixel';

trackCompleteRegistration({
  userId: userId,
  email: email,
  name: name,
  registrationMethod: 'email',
  eventId: `registration_${userId}`, // For deduplication
});
```

**Server-side (in registration endpoint):**

```javascript
TikTokConversionService.safeTrack(
  TikTokConversionService.trackRegistration,
  {
    user: newUser,
    clientIpAddress: req.ip,
    clientUserAgent: req.get('user-agent'),
    eventId: eventId, // Same eventId as browser
    registrationMethod: 'email',
  }
).catch(error => {
  console.error('Failed to track registration:', error);
});
```

## Deduplication Strategy

### How It Works

1. **Browser generates `event_id`** when tracking an event
2. **Browser sends `event_id` to server** via API call
3. **Server uses same `event_id`** when tracking server-side
4. **TikTok automatically deduplicates** events with the same `event_id` within 48 hours

### Event ID Formats

- **InitiateCheckout**: `InitiateCheckout_{userId}_{timestamp}`
- **Purchase**: `purchase_{orderId}` (both browser and server use same format)
- **CompleteRegistration**: `registration_{userId}` (both browser and server use same format)

### Expected Deduplication Rate

- **90%+ deduplication rate** when browser and server events use the same `event_id`
- TikTok processes deduplication within 5-10 minutes
- Check deduplication status in TikTok Events Manager

## Important Notes

### Currency Normalization

- TikTok Events API requires **ISO 4217 currency codes** (e.g., "GEL", "USD", "EUR")
- Currency symbols like "₾" are automatically converted to "GEL"
- Both browser and server-side tracking normalize currency codes

### Privacy Compliance

- All PII (email, phone, names) is **SHA-256 hashed** before sending to TikTok
- User IDs are hashed as `external_id` for better matching
- IP addresses and user agents are sent unhashed (as required by TikTok)

### Error Handling

- All tracking is **non-blocking** - failures don't affect user experience
- Errors are logged but don't throw exceptions
- Use `safeTrack()` wrapper for server-side tracking

## Testing

### Test Event Code

Add `TIKTOK_TEST_EVENT_CODE` to `.env` for testing:

```env
TIKTOK_TEST_EVENT_CODE=your_test_code_here
```

Events sent with test event code will appear in TikTok Events Manager under "Test Events" and won't affect production data.

### Verification

1. Check TikTok Events Manager for incoming events
2. Verify events show correct currency codes (GEL, not ₾)
3. Check deduplication status (should show 90%+ after processing)
4. Verify event parameters match expected values

## Troubleshooting

### Events Not Appearing

- Check Pixel ID is correct in HTML
- Verify Access Token is valid
- Check browser console for errors
- Verify network requests to `analytics.tiktok.com`

### Currency Errors

- Ensure currency normalization is applied
- Check that currency codes are ISO format (GEL, USD, etc.)
- Verify both browser and server normalize currency

### Deduplication Not Working

- Ensure same `event_id` is used for browser and server events
- Check that `event_id` is included in both browser and server payloads
- Wait 5-10 minutes for TikTok to process deduplication

## For Landing Page Implementation

If implementing on a separate landing page domain:

1. **Add TikTok Pixel base code** to landing page HTML
2. **Use same Pixel ID** (`D4KM9EJC77UEBGID26JG`)
3. **Track events** when users interact (clicks, form submissions)
4. **Send events to your main site's API** for server-side tracking with same `event_id`
5. **Ensure currency normalization** is applied

Example for landing page:

```javascript
// On landing page - track button click
trackInitiateCheckout({
  tier: 'ultra',
  value: 69,
  currency: '₾',
  userId: null, // May not have userId on landing page
  eventId: `InitiateCheckout_${Date.now()}`, // Generate unique ID
});

// Then redirect to main site checkout
// Main site will track server-side with same eventId
```

## Support

For issues or questions:
- Check TikTok Events Manager for event status
- Review server logs for tracking errors
- Verify environment variables are set correctly
- Test with test event code first

