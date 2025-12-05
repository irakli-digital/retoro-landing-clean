/**
 * TikTok Events API Service
 * Handles server-side event tracking for TikTok advertising
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

class TikTokConversionService {
  private pixelId: string;
  private accessToken: string;
  private testEventCode?: string;
  private apiVersion: string = 'v1.3';
  private baseUrl: string = 'https://business-api.tiktok.com/open_api';
  private isConfigured: boolean;

  constructor() {
    this.pixelId = process.env.TIKTOK_PIXEL_ID || 'D4KM9EJC77UEBGID26JG';
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN || '';
    this.testEventCode = process.env.TIKTOK_TEST_EVENT_CODE;
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
   * Normalize currency code to ISO format
   */
  private normalizeCurrency(currency: string): string {
    if (!currency) return 'GEL';
    
    const currencyMap: Record<string, string> = {
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
  private buildUserData(userData?: UserData): Record<string, any> {
    const userDataObj: Record<string, any> = {};

    if (!userData) return userDataObj;

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
  private buildProperties(customData?: CustomData): Record<string, any> {
    const properties: Record<string, any> = {};

    if (!customData) return properties;

    if (customData.value !== undefined) {
      properties.value = customData.value;
    }

    if (customData.currency) {
      properties.currency = this.normalizeCurrency(customData.currency);
    }

    if (customData.content_ids && Array.isArray(customData.content_ids) && customData.content_ids.length > 0) {
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
  async sendEvent(eventData: EventData): Promise<{
    success: boolean;
    code?: number;
    message?: string;
    request_id?: string;
    error?: string;
    details?: any;
  }> {
    if (!this.isConfigured) {
      return { success: false, error: 'not_configured' };
    }

    try {
      const eventTime = Math.floor(Date.now() / 1000);
      
      const event: Record<string, any> = {
        event: eventData.eventName,
        timestamp: eventTime.toString(),
        properties: this.buildProperties(eventData.customData),
        context: {
          user: this.buildUserData(eventData.userData),
          page: {
            url: eventData.eventSourceUrl || 'https://mypen.ge',
          },
        },
      };

      if (eventData.eventId) {
        event.event_id = eventData.eventId;
      }

      const payload: Record<string, any> = {
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
  }): Promise<any> {
    const eventData: EventData = {
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
  async trackRegistration(registrationData: {
    user: { email?: string; name?: string; id?: string; _id?: string };
    clientIpAddress?: string;
    clientUserAgent?: string;
    eventId?: string;
    registrationMethod?: string;
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
  async safeTrack(trackingFunction: (...args: any[]) => Promise<any>, ...args: any[]): Promise<any> {
    try {
      return await trackingFunction.apply(this, args);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const tiktokConversionService = new TikTokConversionService();
export default tiktokConversionService;

