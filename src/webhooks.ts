import { HTTPClient } from "./http";
import { WebhookEndpoint, CreateWebhookRequest, APIResponse } from "./types";

export class WebhooksAPI {
  constructor(
    private client: HTTPClient,
    private merchantId: string
  ) {}

  /**
   * Create a new webhook endpoint
   */
  async create(
    webhookData: CreateWebhookRequest
  ): Promise<APIResponse<WebhookEndpoint>> {
    return this.client.post<WebhookEndpoint>(
      `/v1/api/merchants/${this.merchantId}/webhooks`,
      webhookData
    );
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
    return this.client.get<WebhookEndpoint>(
      `/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}`
    );
  }

  /**
   * Update a webhook endpoint
   */
  async update(
    webhookId: string,
    updateData: Partial<CreateWebhookRequest>
  ): Promise<APIResponse<WebhookEndpoint>> {
    return this.client.put<WebhookEndpoint>(
      `/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}`,
      updateData
    );
  }

  /**
   * Delete a webhook endpoint
   */
  async delete(webhookId: string): Promise<APIResponse<{ deleted: boolean }>> {
    return this.client.delete(
      `/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}`
    );
  }

  /**
   * Test a webhook endpoint
   */
  async test(
    webhookId: string
  ): Promise<APIResponse<{ success: boolean; response: any }>> {
    return this.client.post(
      `/v1/api/merchants/${this.merchantId}/webhooks/${webhookId}/test`
    );
  }

  /**
   * Constant-time string comparison to prevent timing attacks.
   * @internal
   */
  private static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Verify webhook signature using HMAC-SHA256.
   * Uses constant-time comparison to prevent timing attacks.
   *
   * @param payload - The raw webhook payload string
   * @param signature - The signature from the X-Webhook-Signature header
   * @param secret - Your webhook secret
   * @returns Promise<boolean> - True if signature is valid
   */
  static async verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    if (typeof crypto === "undefined") {
      throw new Error(
        "crypto is not available. Please use a polyfill or run in a supported environment."
      );
    }

    if (!payload || !signature || !secret) {
      return false;
    }

    try {
      // Create HMAC with SHA256
      const encoder = new TextEncoder();
      const key = encoder.encode(secret);
      const data = encoder.encode(payload);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Extract signature value, handling both 'sha256=xxx' and 'xxx' formats
      const expectedSignature = signature.startsWith("sha256=")
        ? signature.slice(7)
        : signature;

      // Use constant-time comparison to prevent timing attacks
      return this.timingSafeEqual(computedSignature, expectedSignature);
    } catch (error) {
      return false;
    }
  }
}
