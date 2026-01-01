import { WebhooksAPI } from "../webhooks";
import { HTTPClient } from "../http";
import { CreateWebhookRequest, WebhookEndpoint } from "../types";

// Mock HTTPClient
jest.mock("../http");

describe("WebhooksAPI", () => {
  let webhooksAPI: WebhooksAPI;
  let mockClient: jest.Mocked<HTTPClient>;
  const merchantId = "test_merchant_123";

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    } as any;

    webhooksAPI = new WebhooksAPI(mockClient, merchantId);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create()", () => {
    it("should create a webhook endpoint", async () => {
      const webhookRequest: CreateWebhookRequest = {
        url: "https://example.com/webhooks",
        events: ["payment.succeeded", "payment.failed"],
        description: "Test webhook",
      };

      const mockResponse = {
        success: true,
        data: {
          id: "webhook_123",
          url: "https://example.com/webhooks",
          events: ["payment.succeeded", "payment.failed"],
          environment: "sandbox",
          is_active: true,
          secret: "whsec_test123",
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await webhooksAPI.create(webhookRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/webhooks`,
        webhookRequest
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("list()", () => {
    it("should list all webhook endpoints", async () => {
      const mockResponse = {
        success: true,
        data: {
          webhooks: [
            {
              id: "webhook_123",
              url: "https://example.com/webhooks",
              events: ["payment.succeeded"],
              environment: "sandbox",
              is_active: true,
              secret: "whsec_test123",
              created_at: "2024-01-01T00:00:00Z",
            },
          ],
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await webhooksAPI.list();

      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/webhooks`
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("retrieve()", () => {
    it("should retrieve a webhook by ID", async () => {
      const webhookId = "webhook_123";
      const mockResponse = {
        success: true,
        data: {
          id: webhookId,
          url: "https://example.com/webhooks",
          events: ["payment.succeeded"],
          environment: "sandbox",
          is_active: true,
          secret: "whsec_test123",
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await webhooksAPI.retrieve(webhookId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/webhooks/${webhookId}`
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("update()", () => {
    it("should update a webhook endpoint", async () => {
      const webhookId = "webhook_123";
      const updateData = {
        events: ["payment.succeeded", "payment.failed", "refund.created"],
      };

      const mockResponse = {
        success: true,
        data: {
          id: webhookId,
          url: "https://example.com/webhooks",
          events: ["payment.succeeded", "payment.failed", "refund.created"],
          environment: "sandbox",
          is_active: true,
          secret: "whsec_test123",
          created_at: "2024-01-01T00:00:00Z",
        },
      };

      mockClient.put.mockResolvedValue(mockResponse);

      const result = await webhooksAPI.update(webhookId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/webhooks/${webhookId}`,
        updateData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("delete()", () => {
    it("should delete a webhook endpoint", async () => {
      const webhookId = "webhook_123";
      const mockResponse = {
        success: true,
        data: { deleted: true },
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await webhooksAPI.delete(webhookId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/webhooks/${webhookId}`
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("test()", () => {
    it("should test a webhook endpoint", async () => {
      const webhookId = "webhook_123";
      const mockResponse = {
        success: true,
        data: {
          success: true,
          response: { statusCode: 200 },
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await webhooksAPI.test(webhookId);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/webhooks/${webhookId}/test`
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

describe("WebhooksAPI.verifySignature", () => {
  // Note: These tests require crypto.subtle which is available in Node.js 15+
  // In older environments or when crypto is undefined, the method throws

  it("should return false for empty payload", async () => {
    const result = await WebhooksAPI.verifySignature("", "sig123", "secret");
    expect(result).toBe(false);
  });

  it("should return false for empty signature", async () => {
    const result = await WebhooksAPI.verifySignature("payload", "", "secret");
    expect(result).toBe(false);
  });

  it("should return false for empty secret", async () => {
    const result = await WebhooksAPI.verifySignature("payload", "sig", "");
    expect(result).toBe(false);
  });

  it("should return false for invalid signature", async () => {
    const result = await WebhooksAPI.verifySignature(
      '{"event": "payment.succeeded"}',
      "invalid_signature",
      "webhook_secret"
    );
    expect(result).toBe(false);
  });

  it("should handle sha256= prefix in signature", async () => {
    // The method should strip 'sha256=' prefix if present
    const result = await WebhooksAPI.verifySignature(
      '{"event": "payment.succeeded"}',
      "sha256=invalid_signature",
      "webhook_secret"
    );
    expect(result).toBe(false);
  });
});
