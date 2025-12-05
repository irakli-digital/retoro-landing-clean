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
  if (typeof window === 'undefined') return null;
  
  const fbpCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_fbp='));

  return fbpCookie ? fbpCookie.split('=')[1] : null;
};

/**
 * Get Facebook click ID from _fbc cookie
 */
export const getFbc = (): string | null => {
  if (typeof window === 'undefined') return null;
  
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
 * This fires browser event with eventID for deduplication
 */
export const trackInitiateCheckout = (params: {
  tier: string;
  value: number;
  currency: string;
  userId?: string;
  eventId?: string;
}) => {
  const { tier, value, currency, userId, eventId } = params;

  // Generate unique event ID for deduplication
  const finalEventId = eventId || generateEventId('InitiateCheckout', userId);

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
      eventID: finalEventId, // For deduplication with server event
    });
    console.log('✅ Facebook InitiateCheckout tracked:', { tier, value, currency, eventId: finalEventId });
  } else {
    console.warn('Facebook Pixel not loaded');
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
  eventId?: string;
}) => {
  const { orderId, tier, value, currency, eventId } = params;

  // Generate event ID from order ID for consistency
  const finalEventId = eventId || `purchase_${orderId}`;

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
      eventID: finalEventId, // For deduplication with server event
    });
    console.log('✅ Facebook Purchase tracked:', { orderId, tier, value, currency, eventId: finalEventId });
  } else {
    console.warn('Facebook Pixel not loaded');
  }
};

/**
 * Track CompleteRegistration event with deduplication
 */
export const trackCompleteRegistration = (params: {
  userId: string;
  email?: string;
  name?: string;
  registrationMethod?: string;
  eventId?: string;
}) => {
  const { userId, registrationMethod = 'email', eventId } = params;

  // Generate unique event ID for deduplication
  const finalEventId = eventId || `registration_${userId}`;

  // Track browser-side event
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'Account Registration',
      status: 'completed',
      registration_method: registrationMethod,
    }, {
      eventID: finalEventId, // For deduplication with server event
    });
    console.log('✅ Facebook CompleteRegistration tracked:', { userId, registrationMethod, eventId: finalEventId });
  } else {
    console.warn('Facebook Pixel not loaded');
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

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Subscribe', {
      content_type: 'product',
      content_ids: [toTier],
      content_name: `Mypen ${toTier.toUpperCase()} Subscription`,
      content_category: 'subscription',
      status: eventType,
      ...(value && { value }),
      ...(currency && { currency }),
    });
    console.log('✅ Facebook Subscribe tracked:', { fromTier, toTier, eventType });
  } else {
    console.warn('Facebook Pixel not loaded');
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
 * Track page view (already initialized in scripts config, but can be called manually)
 */
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

