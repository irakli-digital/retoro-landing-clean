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
 * @param pixelId - TikTok Pixel ID (default: from env)
 */
const getTikTokInstance = (pixelId?: string) => {
  if (typeof window === 'undefined' || !window.ttq) {
    return null;
  }
  const pixelIdToUse = pixelId || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'D4KM9EJC77UEBGID26JG';
  return window.ttq.instance ? window.ttq.instance(pixelIdToUse) : window.ttq;
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
 * Track page view (already initialized in scripts config, but can be called manually)
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

