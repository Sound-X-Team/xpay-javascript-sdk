import { HTTPClient } from "../http";
import { XPayConfig, XPayError } from "../types";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("HTTPClient", () => {
  let httpClient: HTTPClient;
  const defaultConfig: XPayConfig = {
    apiKey: "sk_sandbox_test_key_12345",
    merchantId: "merchant_123",
    environment: "sandbox",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    httpClient = new HTTPClient(defaultConfig);
  });

  describe("constructor", () => {
    it("should create client with default configuration", () => {
      const client = new HTTPClient(defaultConfig);
      expect(client).toBeInstanceOf(HTTPClient);
    });

    it("should use custom base URL if provided", () => {
      const customConfig: XPayConfig = {
        ...defaultConfig,
        baseUrl: "https://custom-api.example.com",
      };
      const client = new HTTPClient(customConfig);
      expect(client).toBeInstanceOf(HTTPClient);
    });
  });

  describe("get()", () => {
    it("should make GET request with correct headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: "123" } }),
      });

      const result = await httpClient.get("/v1/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/test"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "X-API-Key": "sk_sandbox_test_key_12345",
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result.success).toBe(true);
    });

    it("should include X-Environment header for sandbox", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await httpClient.get("/v1/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Environment": "sandbox",
          }),
        })
      );
    });
  });

  describe("post()", () => {
    it("should make POST request with body", async () => {
      const requestData = { amount: "10.00", currency: "USD" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: "pay_123" } }),
      });

      const result = await httpClient.post("/v1/payments", requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/payments"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestData),
        })
      );
      expect(result.success).toBe(true);
    });

    it("should make POST request without body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await httpClient.post("/v1/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("put()", () => {
    it("should make PUT request with body", async () => {
      const updateData = { name: "Updated Name" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: "123", name: "Updated Name" },
        }),
      });

      const result = await httpClient.put("/v1/customers/123", updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/customers/123"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        })
      );
    });
  });

  describe("delete()", () => {
    it("should make DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { deleted: true } }),
      });

      const result = await httpClient.delete("/v1/webhooks/123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/webhooks/123"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("error handling", () => {
    it("should throw XPayError for 401 authentication error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          message: "Invalid API key",
          error_code: "AUTHENTICATION_ERROR",
        }),
      });

      await expect(httpClient.get("/v1/test")).rejects.toThrow(XPayError);
    });

    it("should throw XPayError for 400 validation error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({
          message: "Invalid request",
          error_code: "VALIDATION_ERROR",
        }),
      });

      await expect(
        httpClient.post("/v1/test", { invalid: true })
      ).rejects.toThrow(XPayError);
    });

    it("should throw XPayError for 500 server error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ message: "Internal server error" }),
      });

      await expect(httpClient.get("/v1/test")).rejects.toThrow(XPayError);
    });

    it("should throw XPayError for network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      await expect(httpClient.get("/v1/test")).rejects.toThrow(XPayError);
    });

    it("should handle non-JSON error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        json: async () => {
          throw new Error("Not JSON");
        },
      });

      await expect(httpClient.get("/v1/test")).rejects.toThrow(XPayError);
    });
  });

  describe("environment detection", () => {
    it("should detect sandbox environment from API key prefix", async () => {
      const sandboxClient = new HTTPClient({
        apiKey: "xpay_sandbox_test123",
        merchantId: "merchant_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await sandboxClient.get("/v1/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Environment": "sandbox",
          }),
        })
      );
    });

    it("should detect live environment from API key prefix", async () => {
      const liveClient = new HTTPClient({
        apiKey: "xpay_live_test123",
        merchantId: "merchant_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await liveClient.get("/v1/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Environment": "live",
          }),
        })
      );
    });
  });

  describe("response handling", () => {
    it("should wrap raw responses in APIResponse format", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "123", name: "Test" }), // Raw response without success/data wrapper
      });

      const result = await httpClient.get("/v1/test");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: "123", name: "Test" });
    });

    it("should pass through already-wrapped responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: "123" },
          message: "Success",
        }),
      });

      const result = await httpClient.get("/v1/test");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: "123" });
      expect(result.message).toBe("Success");
    });
  });
});
