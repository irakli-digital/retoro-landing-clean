# Facebook Cross-Domain Tracking Setup

## Overview

This landing page (mypen.ge) shares the **same Facebook Pixel ID (257835033032129)** with the main application (chat.mypen.ge) to enable cross-domain tracking. This allows Facebook to track user journeys across both domains.

## Configuration

### Environment Variables

`.env.local`:
```bash
# Facebook Pixel (same as main app for cross-domain tracking)
NEXT_PUBLIC_FB_PIXEL_ID=257835033032129

# GTM (also shared)
NEXT_PUBLIC_GTM_ID=GTM-WR2RQD2
```

### Implementation

The Facebook Pixel is configured in `config/scripts.config.ts` and automatically injected via the `ScriptInjector` component in `app/layout.tsx`.

**Key Features:**
- ✅ Same Pixel ID as main app (257835033032129)
- ✅ Automatically tracks PageView on all pages
- ✅ Loads via Next.js Script component with `afterInteractive` strategy
- ✅ Creates `_fbp` cookie for cross-domain tracking
- ✅ Enabled in all environments (dev, staging, production)

## Cross-Domain Tracking Flow

### User Journey Example:

```
1. User lands on mypen.ge (landing page)
   → Facebook Pixel fires
   → Creates _fbp cookie: fb.1.1234567890.1234567890
   → Tracks PageView

2. User clicks "დაწყება" (Start) button
   → Redirects to chat.mypen.ge
   → _fbp cookie carried over (same domain suffix)
   → Facebook Pixel on chat.mypen.ge reads same _fbp cookie

3. User registers on chat.mypen.ge
   → CompleteRegistration event tracked
   → Uses same _fbp cookie
   → Facebook links registration to landing page visit

4. User subscribes (InitiateCheckout + Purchase)
   → Facebook can attribute conversion to landing page
   → Measures full funnel: Landing → App → Registration → Purchase
```

### How Cross-Domain Works

Facebook uses the `_fbp` cookie to identify the same user across domains:

**Landing Page (mypen.ge):**
```javascript
fbq('init', '257835033032129');  // Same pixel ID
fbq('track', 'PageView');
// Creates: _fbp=fb.1.1234567890.1234567890
```

**Main App (chat.mypen.ge):**
```javascript
fbq('init', '257835033032129');  // Same pixel ID
fbq('track', 'CompleteRegistration');
// Reads same: _fbp=fb.1.1234567890.1234567890
```

**Result**: Facebook sees both events from the same user and can measure:
- Landing page effectiveness
- Conversion rate from landing to app
- Full customer journey
- Accurate attribution

## Events Tracked

### Landing Page (mypen.ge)

**Automatic Events:**
- ✅ `PageView` - Tracked on every page load

**Potential Custom Events to Add:**
- `Lead` - When user clicks CTA button
- `ViewContent` - When viewing specific sections
- `Contact` - When user submits contact form (if applicable)

### Main App (chat.mypen.ge)

**Standard Events:**
- ✅ `CompleteRegistration` - User signs up
- ✅ `InitiateCheckout` - User clicks "Select Plan"
- ✅ `Purchase` - Successful subscription payment

## Testing Cross-Domain Tracking

### Step 1: Test Landing Page Pixel

```bash
# Start landing page
cd "/Users/iraklichkheidze/Desktop/AI Projects/Mypen Landing - next"
npm run dev
```

**Open browser:**
1. Go to http://localhost:3000
2. Open DevTools → Network tab
3. Filter by "facebook" or "tr?"
4. Should see request to `facebook.com/tr` with:
   - `id=257835033032129`
   - `ev=PageView`

**Check cookies:**
1. DevTools → Application → Cookies
2. Should see `_fbp` cookie created

### Step 2: Test Cross-Domain Flow

**Simulate user journey:**
1. Visit landing page: http://localhost:3000
2. Note the `_fbp` cookie value
3. Click link to main app (or manually navigate)
4. Check `_fbp` cookie on main app
5. Should be same value (if domains allow cookie sharing)

**Note**: In localhost testing, cookies may not persist across different ports. Test in production with actual domains.

### Step 3: Verify in Facebook Events Manager

**Within 5-15 minutes:**
1. Go to https://business.facebook.com/events_manager
2. Select Pixel: **257835033032129**
3. Click "Test Events" or "Overview"
4. Look for:
   - PageView events from landing page domain
   - Registration/Purchase events from main app domain
   - Same `fbp` value linking events together

## Domain Configuration

### Current Setup:

- **Landing Page**: mypen.ge (or www.mypen.ge)
- **Main App**: chat.mypen.ge
- **Pixel ID**: 257835033032129 (shared)
- **Cookie Domain**: `.mypen.ge` (automatically set by Facebook)

### Cookie Sharing Requirements:

For `_fbp` cookie to work across domains:
- ✅ Same root domain (mypen.ge)
- ✅ Same Pixel ID
- ✅ Both sites have Facebook Pixel installed
- ✅ Cookies set to `.mypen.ge` (automatic)

**Facebook automatically sets the cookie domain to the root domain**, so no additional configuration needed.

## Adding Custom Events to Landing Page

If you want to track more than just PageView on the landing page:

### Example: Track CTA Button Clicks

Create a utility file:

**File**: `lib/facebook-tracking.ts`

```typescript
/**
 * Track custom Facebook Pixel events on landing page
 */

export const trackLeadEvent = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead', {
      content_name: 'CTA Button Click',
      content_category: 'landing_page'
    });
  }
};

export const trackViewContent = (contentName: string) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: 'landing_page'
    });
  }
};
```

**Usage in component:**

```typescript
import { trackLeadEvent } from '@/lib/facebook-tracking';

// In your CTA button component
const handleCTAClick = () => {
  trackLeadEvent();
  // Redirect to main app
  window.location.href = 'https://chat.mypen.ge';
};
```

## GTM Integration

The landing page also has GTM (GTM-WR2RQD2) - **same as main app**.

**Important**: Since we're using direct Facebook Pixel now:
- ✅ Keep GTM for Google Analytics and other tracking
- ❌ Remove any Facebook Pixel tags from GTM (same as main app)
- ✅ GTM and direct pixel can coexist

## Facebook Ads Best Practices

### 1. Use Custom Conversions

Create custom conversions in Facebook Events Manager:
- "Landing Page Visit" - PageView on mypen.ge
- "App Registration" - CompleteRegistration on chat.mypen.ge
- "Subscription" - Purchase on chat.mypen.ge

### 2. Track Full Funnel

Set up conversion funnel:
1. Landing Page Visit (PageView)
2. App Visit (PageView on chat.mypen.ge)
3. Registration (CompleteRegistration)
4. Checkout (InitiateCheckout)
5. Purchase (Purchase)

### 3. Optimize for Purchases

In Facebook Ads Manager:
- Set campaign objective to "Conversions"
- Optimize for "Purchase" event
- Facebook will automatically optimize for users likely to complete full funnel

## Monitoring

### Check Cross-Domain Attribution

**Facebook Events Manager → Pixel → Events:**
1. Click on "Purchase" event
2. Check "Event Source URL"
3. Should see events from both:
   - mypen.ge (landing page visits)
   - chat.mypen.ge (purchases)

**Attribution Window:**
- Facebook default: 7-day click, 1-day view
- Users who visited landing page and purchased within 7 days will be attributed

### Check Cookie Consistency

**Browser DevTools:**
```javascript
// On landing page
console.log(document.cookie.match(/_fbp=([^;]+)/)[1]);

// On main app (after navigation)
console.log(document.cookie.match(/_fbp=([^;]+)/)[1]);

// Should be the same value
```

## Troubleshooting

### _fbp cookie not persisting across domains

**Possible causes:**
- Different root domains (should be same: mypen.ge)
- Browser blocking third-party cookies
- Incognito/private mode

**Solution:**
- Verify both domains end with `.mypen.ge`
- Test in normal browser mode (not incognito)
- Check browser cookie settings

### Events not linking in Facebook

**Check:**
- Both sites have same Pixel ID (257835033032129) ✓
- Both sites are loading Facebook Pixel ✓
- `_fbp` cookie value is same across domains
- Events appear in Events Manager with same `fbp` parameter

### Attribution not showing

**Wait time**: Attribution data can take 24-48 hours to process in Facebook

**Check:**
- Sufficient data volume (Facebook needs multiple events)
- Attribution window settings (default 7-day click)
- Events are firing correctly on both domains

## Production Deployment

### Before deploying:

1. **Verify environment variables** in production `.env`:
   ```bash
   NEXT_PUBLIC_FB_PIXEL_ID=257835033032129
   NEXT_PUBLIC_GTM_ID=GTM-WR2RQD2
   ```

2. **Build and test**:
   ```bash
   npm run build
   npm run start
   ```

3. **Test in production**:
   - Visit actual production URL (mypen.ge)
   - Check Facebook Pixel fires
   - Verify `_fbp` cookie created
   - Test navigation to chat.mypen.ge
   - Verify cookie persists

4. **Monitor Events Manager** for 24-48 hours after deployment

## Expected Results

**After implementation:**
- ✅ Landing page visits tracked in Facebook
- ✅ User journey tracked across domains
- ✅ Accurate attribution from landing to purchase
- ✅ Better Facebook ad optimization
- ✅ Full funnel visibility

**Metrics to watch:**
- Landing page visits (PageView events)
- Landing → App conversion rate
- Landing → Registration conversion rate
- Landing → Purchase conversion rate
- Return on Ad Spend (ROAS) improvement

## Summary

✅ **Same Facebook Pixel** (257835033032129) on both domains
✅ **Cross-domain tracking** via `_fbp` cookie
✅ **Full funnel measurement** from landing to purchase
✅ **GTM still works** for other analytics
✅ **Easy to add** custom events as needed

**No server-side tracking needed for landing page** - it's a static marketing site, browser-side pixel is sufficient. Server-side tracking is most valuable for the main app where we have purchase events and user data.
