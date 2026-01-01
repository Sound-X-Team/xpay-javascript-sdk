import { HTTPClient } from './http';
import { PaymentsAPI } from './payments';
import { WebhooksAPI } from './webhooks';
import { CustomersAPI } from './customers';
import { XPayConfig } from './types';

export class XPay {
  private client: HTTPClient;
  private merchantId: string;
  public payments: PaymentsAPI;
  public webhooks: WebhooksAPI;
  public customers: CustomersAPI;

  // Static access to utility classes
  static PaymentsAPI = PaymentsAPI;
  static WebhooksAPI = WebhooksAPI;
  static CustomersAPI = CustomersAPI;

  constructor(config: XPayConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    // Extract merchant ID from config or derive from API key
    this.merchantId = config.merchantId || this.extractMerchantIdFromApiKey(config.apiKey);

    this.client = new HTTPClient(config);
    this.payments = new PaymentsAPI(this.client, this.merchantId);
    this.webhooks = new WebhooksAPI(this.client, this.merchantId);
    this.customers = new CustomersAPI(this.client, this.merchantId);
  }

  private extractMerchantIdFromApiKey(apiKey: string): string {
    // For now, use a default merchant ID or extract from API key structure
    // In production, this would be handled by the backend or passed explicitly
    return 'default';
  }

  /**
   * Test API connectivity and authentication
   */
  async ping(): Promise<{ success: boolean; timestamp: string }> {
    const response = await this.client.get<{ timestamp: string }>('/v1/healthz');
    return {
      success: response.success,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get payment methods available for this merchant
   */
  async getPaymentMethods(): Promise<{
    payment_methods: Array<{
      type: string;
      name: string;
      description: string;
      enabled: boolean;
      currencies: string[];
    }>;
    environment: string;
    merchant_id: string;
  }> {
    const response = await this.client.get<any>(`/v1/api/merchants/${this.merchantId}/payment-methods`);
    return response.data;
  }
}

// Export everything for convenient importing
export * from './types';
export * from './payments';
export * from './webhooks';
export * from './customers';
export { HTTPClient } from './http';

// Default export
export default XPay;
