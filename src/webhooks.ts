import { HTTPClient } from './http';
import { 
  WebhookEndpoint, 
  CreateWebhookRequest, 
  APIResponse 
} from './types';

export class WebhooksAPI {
  constructor(private client: HTTPClient, private merchantId: string) {}

  /**
   * Create a new webhook endpoint
   */
  async create(webhookData: CreateWebhookRequest): Promise<APIResponse<WebhookEndpoint>> {
    return this.client.post<WebhookEndpoint>(`/v1/api/merchants/${this.merchantId}/webhooks`, webhookData);
  }

  /**
   * List all webhook endpoints
   */
  async list(): Promise<APIResponse<{ webhooks: WebhookEndpoint[] }>> {
    return this.client.get(`/v1/api/merchants/${this.merchantId}/webhooks`);
  }

  /**
   * Retrieve a webhook endpoint by ID
   */
  async retrieve(webhookId: string): Promise<APIResponse<WebhookEndpoint>> {
    return this.client.get<WebhookEndpoint>(`/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}`);
  }

  /**
   * Update a webhook endpoint
   */
  async update(
    webhookId: string, 
    updateData: Partial<CreateWebhookRequest>
  ): Promise<APIResponse<WebhookEndpoint>> {
    return this.client.put<WebhookEndpoint>(`/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}`, updateData);
  }

  /**
   * Delete a webhook endpoint
   */
  async delete(webhookId: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.client.delete(`/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}`);
  }

  /**
   * Test a webhook endpoint
   */
  async test(webhookId: string): Promise<APIResponse<{ success: boolean; response: any }>> {
    return this.client.post(`/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}/test`);
  }

  /**
   * Verify webhook signature
   */
  static async verifySignature(
    payload: string, 
    signature: string, 
    secret: string
  ): Promise<boolean> {
    if (typeof crypto === 'undefined') {
      throw new Error('crypto is not available. Please use a polyfill or run in a supported environment.');
    }

    try {
      // Create HMAC with SHA256
      const encoder = new TextEncoder();
      const key = encoder.encode(secret);
      const data = encoder.encode(payload);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Compare signatures in constant time
      const expectedSignature = signature.replace('sha256=', '');
      return computedSignature === expectedSignature;
    } catch (error) {
      return false;
    }
  }
}
