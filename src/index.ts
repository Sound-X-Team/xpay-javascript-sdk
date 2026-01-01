import { HTTPClient } from "./http";
import { PaymentsAPI } from "./payments";
import { WebhooksAPI } from "./webhooks";
import { CustomersAPI } from "./customers";
import { XPayConfig, XPayError, PaymentMethods } from "./types";

/**
 * Main XPay SDK client.
 *
 * @example
 * ```typescript
 * const xpay = new XPay({
 *   apiKey: 'sk_sandbox_...',
 *   merchantId: 'your_merchant_id',
 *   environment: 'sandbox'
 * });
 *
 * const payment = await xpay.payments.create({
 *   amount: '10.00',
 *   currency: 'USD',
 *   payment_method: 'stripe'
 * });
 * ```
 */
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
      throw new XPayError("API key is required", "MISSING_API_KEY");
    }

    if (!config.merchantId) {
      throw new XPayError(
        "Merchant ID is required. Get your merchant ID from the X-Pay dashboard.",
        "MISSING_MERCHANT_ID"
      );
    }

    this.merchantId = config.merchantId;
    this.client = new HTTPClient(config);
    this.payments = new PaymentsAPI(this.client, this.merchantId);
    this.webhooks = new WebhooksAPI(this.client, this.merchantId);
    this.customers = new CustomersAPI(this.client, this.merchantId);
  }

  /**
   * Test API connectivity and authentication
   */
  async ping(): Promise<{ success: boolean; timestamp: string }> {
    const response = await this.client.get<{ timestamp: string }>(
      "/v1/healthz"
    );
    return {
      success: response.success,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get payment methods available for this merchant
   */
  async getPaymentMethods(): Promise<PaymentMethods> {
    const response = await this.client.get<PaymentMethods>(
      `/v1/api/merchants/${this.merchantId}/payment-methods`
    );
    return response.data;
  }
}

// Export everything for convenient importing
export * from "./types";
export * from "./payments";
export * from "./webhooks";
export * from "./customers";
export { HTTPClient } from "./http";

// Default export
export default XPay;
