import { HTTPClient } from './http';
import { 
  PaymentRequest, 
  Payment, 
  PaymentMethods, 
  APIResponse,
  PAYMENT_METHOD_CURRENCIES,
  SUPPORTED_CURRENCIES,
  XPayError
} from './types';

export class PaymentsAPI {
  // Cache payment methods per merchant to avoid repeated network calls
  private paymentMethodsCache?: PaymentMethods;

  constructor(private client: HTTPClient, private merchantId: string) {}

  /**
   * Get the default currency for a payment method
   */
  private getDefaultCurrency(paymentMethod: string): string {
    const methodConfig = PAYMENT_METHOD_CURRENCIES[paymentMethod];
    return methodConfig?.default_currency || 'USD';
  }

  /**
   * Validate currency for payment method
   */
  private validateCurrency(paymentMethod: string, currency: string): void {
    const methodConfig = PAYMENT_METHOD_CURRENCIES[paymentMethod];
    
    if (!methodConfig) {
      throw new XPayError(
        `Unsupported payment method: ${paymentMethod}`,
        'INVALID_PAYMENT_METHOD'
      );
    }

    if (!methodConfig.supported_currencies.includes(currency)) {
      throw new XPayError(
        `Currency ${currency} is not supported for payment method ${paymentMethod}. Supported currencies: ${methodConfig.supported_currencies.join(', ')}`,
        'INVALID_CURRENCY'
      );
    }
  }

  /**
   * Create a new payment
   */
  async create(paymentData: PaymentRequest): Promise<APIResponse<Payment>> {
    // Auto-assign currency if not provided
    const processedData = { ...paymentData };
    // If currency not provided, try to derive from merchant's available payment methods
    if (!processedData.currency) {
      try {
        // Load from cache or fetch
        if (!this.paymentMethodsCache) {
          const pmResponse = await this.getPaymentMethods();
          if (pmResponse && pmResponse.success) {
            this.paymentMethodsCache = pmResponse.data;
          }
        }

        // Find the payment method entry
        const available = this.paymentMethodsCache?.available_methods || [];
        const methodEntry = available.find(m => m.type === paymentData.payment_method);

        if (methodEntry && methodEntry.currencies && methodEntry.currencies.length > 0) {
          processedData.currency = methodEntry.currencies[0];
        } else {
          // Fall back to SDK's static mapping
          processedData.currency = this.getDefaultCurrency(paymentData.payment_method);
        }
      } catch (err) {
        // If anything fails, fall back to static mapping
        processedData.currency = this.getDefaultCurrency(paymentData.payment_method);
      }
    }

    // Validate currency for the payment method
    this.validateCurrency(paymentData.payment_method, processedData.currency);

    return this.client.post<Payment>(`/v1/api/merchants/${this.merchantId}/payments`, processedData);
  }

  /**
   * Retrieve a payment by ID
   */
  async retrieve(paymentId: string): Promise<APIResponse<Payment>> {
    return this.client.get<Payment>(`/v1/api/merchants/${this.merchantId}/payments/${paymentId}`);
  }

  /**
   * List all payments
   */
  async list(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    customer_id?: string;
    created_after?: string;
    created_before?: string;
  }): Promise<APIResponse<{ payments: Payment[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/v1/api/merchants/${this.merchantId}/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.client.get(endpoint);
  }

  /**
   * Cancel a payment (if supported by payment method)
   */
  async cancel(paymentId: string): Promise<APIResponse<Payment>> {
    return this.client.post<Payment>(`/v1/api/merchants/${this.merchantId}/payments/${paymentId}/cancel`);
  }

  /**
   * Get available payment methods for this merchant
   */
  async getPaymentMethods(country?: string): Promise<APIResponse<PaymentMethods>> {
    const endpoint = `/v1/api/merchants/${this.merchantId}/payment-methods${country ? `?country=${country}` : ''}`;
    return this.client.get<PaymentMethods>(endpoint);
  }

  /**
   * Get supported currencies for a payment method
   */
  getSupportedCurrencies(paymentMethod: string): string[] {
    const methodConfig = PAYMENT_METHOD_CURRENCIES[paymentMethod];
    return methodConfig?.supported_currencies || [];
  }

  /**
   * Convert amount to smallest currency unit (e.g., dollars to cents)
   */
  static toSmallestUnit(amount: number, currency: string): number {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    if (!currencyInfo) {
      throw new XPayError(`Unsupported currency: ${currency}`, 'INVALID_CURRENCY');
    }
    
    return Math.round(amount * Math.pow(10, currencyInfo.decimal_places));
  }

  /**
   * Convert amount from smallest currency unit (e.g., cents to dollars)
   */
  static fromSmallestUnit(amount: number, currency: string): number {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    if (!currencyInfo) {
      throw new XPayError(`Unsupported currency: ${currency}`, 'INVALID_CURRENCY');
    }
    
    return amount / Math.pow(10, currencyInfo.decimal_places);
  }

  /**
   * Format amount for display with currency symbol
   */
  static formatAmount(amount: number, currency: string, fromSmallestUnit: boolean = true): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    if (!currencyInfo) {
      throw new XPayError(`Unsupported currency: ${currency}`, 'INVALID_CURRENCY');
    }
    
    const displayAmount = fromSmallestUnit 
      ? this.fromSmallestUnit(amount, currency)
      : amount;
    
    return `${currencyInfo.symbol}${displayAmount.toFixed(currencyInfo.decimal_places)}`;
  }

  /**
   * Confirm a payment (for payment methods that require confirmation)
   */
  async confirm(
    paymentId: string,
    confirmationData?: {
      payment_method_id?: string;
      return_url?: string;
    }
  ): Promise<APIResponse<Payment>> {
    return this.client.post<Payment>(`/v1/api/merchants/${this.merchantId}/payments/${paymentId}/confirm`, confirmationData);
  }

  /**
   * Poll payment status (useful for async payment methods like MoMo)
   * @param paymentId - The payment ID to poll
   * @param options - Polling options
   * @returns Promise that resolves when payment reaches a final state
   */
  async pollPaymentStatus(
    paymentId: string,
    options?: {
      maxAttempts?: number;
      intervalMs?: number;
      finalStatuses?: string[];
    }
  ): Promise<Payment> {
    const maxAttempts = options?.maxAttempts || 30; // 30 attempts
    const intervalMs = options?.intervalMs || 2000; // 2 seconds
    const finalStatuses = options?.finalStatuses || ['succeeded', 'completed', 'failed', 'cancelled'];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await this.retrieve(paymentId);

      if (finalStatuses.includes(response.data.status)) {
        return response.data;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new XPayError(
      'Payment status polling timeout',
      'POLLING_TIMEOUT',
      408
    );
  }
}
