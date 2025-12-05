# Facebook Pixel Setup - COMPLETE ✅

## What Was Done

### 1. Added Facebook Pixel ID
**File**: `.env.local`
```bash
NEXT_PUBLIC_FB_PIXEL_ID=257835033032129
```
✅ Same Pixel ID as main app (chat.mypen.ge)

### 2. Enabled Facebook Pixel
**File**: `config/scripts.config.ts`
- Changed from production-only to always enabled
- Added comment about cross-domain tracking
- Pixel loads automatically via ScriptInjector

### 3. Created Documentation
**File**: `FACEBOOK_CROSS_DOMAIN_TRACKING.md`
- Complete cross-domain tracking guide
- Testing procedures
- Troubleshooting tips
- Best practices

## How It Works

```
Landing Page (mypen.ge)
  → Facebook Pixel fires
  → Creates _fbp cookie
  → Tracks PageView
  ↓
User clicks "Start" button
  ↓
Main App (chat.mypen.ge)
  → Same Facebook Pixel
  → Reads same _fbp cookie
  → Tracks Registration/Purchase
  ↓
Facebook links all events together
  → Full user journey tracked
  → Accurate attribution
```

## Quick Test

```bash
# Start the landing page
npm run dev

# Open browser
# Go to http://localhost:3000
# Open DevTools → Network tab
# Filter by "facebook" or "tr?"
# Should see Facebook Pixel request

# Check cookies
# DevTools → Application → Cookies
# Should see _fbp cookie
```

## Deployment

```bash
# Build
npm run build

# Test production build locally
npm run start

# Deploy to production
# (your deployment process)
```

## Verify in Production

1. **Visit your landing page**: https://mypen.ge
2. **Check Facebook Events Manager**: https://business.facebook.com/events_manager
3. **Select Pixel**: 257835033032129
4. **Look for**: PageView events from mypen.ge domain

## Cross-Domain Tracking

**Same Pixel ID on both domains:**
- Landing Page: mypen.ge → Pixel 257835033032129
- Main App: chat.mypen.ge → Pixel 257835033032129

**Result:**
- Facebook tracks user journey across domains
- Landing page visits linked to purchases
- Accurate ad attribution
- Better ROAS measurement

## No Server-Side Needed for Landing Page

The landing page is a static marketing site, so:
- ✅ Browser-side Facebook Pixel is sufficient
- ✅ PageView tracking works automatically
- ✅ Cross-domain tracking via _fbp cookie
- ❌ No need for Conversion API (no transactions on landing page)

**Server-side Conversion API** is only on the main app (chat.mypen.ge) where:
- Purchase events happen
- User data is available
- Deduplication with browser events is needed

## GTM Configuration

**Same as main app:**
- Keep GTM (GTM-WR2RQD2) for Google Analytics
- Remove Facebook Pixel tags from GTM (use direct pixel instead)
- GTM and direct pixel coexist without issues

## Summary

✅ Facebook Pixel configured with same ID as main app
✅ Cross-domain tracking enabled
✅ PageView automatically tracked
✅ Ready for production deployment
✅ Documentation complete

**Next**: Deploy to production and monitor Events Manager
