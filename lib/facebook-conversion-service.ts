/**
 * Facebook Conversion API Service
 * Handles server-side event tracking for Facebook advertising
 */

import axios from 'axios';
import crypto from 'crypto';

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string; // Facebook browser pixel ID
  fbc?: string; // Facebook click ID
}

interface CustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  content_category?: string;
  num_items?: number;
}

interface EventData {
  eventName: string;
  eventId?: string;
  userData?: UserData;
  customData?: CustomData;
  eventSourceUrl?: string;
}

class FacebookConversionService {
  private pixelId: string;
  private accessToken: string;
  private testEventCode?: string;
  private apiVersion: string = 'v19.0';
  private baseUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.pixelId = process.env.FACEBOOK_PIXEL_ID || '257835033032129';
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
    this.testEventCode = process.env.FACEBOOK_TEST_EVENT_CODE;
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    this.isConfigured = !!(this.pixelId && this.accessToken);
  }

  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Hash user data for privacy compliance
   */
  private hashData(data: string): string {
    if (!data) return '';
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
  }

  /**
   * Normalize phone number for hashing
   */
  private normalizePhone(phone: string): string | null {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    // Assume Georgian numbers if no country code
    return cleaned.length === 9 ? `995${cleaned}` : cleaned;
  }

  /**
   * Build user data object for Facebook API
   */
  private buildUserData(userData?: UserData): Record<string, any> {
    const userDataObj: Record<string, any> = {};

    if (!userData) return userDataObj;

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
  async sendEvent(eventData: EventData): Promise<{
    success: boolean;
    events_received?: number;
    messages_received?: number;
    fbtrace_id?: string;
    error?: string;
    details?: any;
  }> {
    if (!this.isConfigured) {
      return { success: false, error: 'not_configured' };
    }

    try {
      const eventTime = Math.floor(Date.now() / 1000);
      
      const event: Record<string, any> = {
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

      const payload: Record<string, any> = {
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

    } catch (error: any) {
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
  async trackPurchase(purchaseData: {
    user: { email?: string; name?: string; id?: string; _id?: string };
    orderId: string;
    value: number;
    currency: string;
    tier: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbp?: string;
    fbc?: string;
  }): Promise<any> {
    const eventData: EventData = {
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
  async trackRegistration(registrationData: {
    user: { email?: string; name?: string; id?: string; _id?: string };
    clientIpAddress?: string;
    clientUserAgent?: string;
    eventId?: string;
    registrationMethod?: string;
    fbp?: string;
    fbc?: string;
  }): Promise<any> {
    const eventData: EventData = {
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
  async trackInitiateCheckout(checkoutData: {
    user: { email?: string; name?: string; id?: string; _id?: string };
    tier: string;
    value: number;
    currency: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    eventId?: string;
    fbp?: string;
    fbc?: string;
  }): Promise<any> {
    const eventData: EventData = {
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
  async trackSubscriptionChange(subscriptionData: {
    user: { email?: string; name?: string; id?: string; _id?: string };
    fromTier: string;
    toTier: string;
    eventType: 'upgrade' | 'downgrade';
    clientIpAddress?: string;
    clientUserAgent?: string;
  }): Promise<any> {
    const eventData: EventData = {
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
      },
    };

    return this.sendEvent(eventData);
  }

  /**
   * Safe wrapper for tracking events
   */
  async safeTrack(trackingFunction: (...args: any[]) => Promise<any>, ...args: any[]): Promise<any> {
    try {
      return await trackingFunction.apply(this, args);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const facebookConversionService = new FacebookConversionService();
export default facebookConversionService;

