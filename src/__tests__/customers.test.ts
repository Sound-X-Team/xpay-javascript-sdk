import { CustomersAPI, Customer, CreateCustomerRequest } from "../customers";
import { HTTPClient } from "../http";

// Mock HTTPClient
jest.mock("../http");

describe("CustomersAPI", () => {
  let customersAPI: CustomersAPI;
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

    customersAPI = new CustomersAPI(mockClient, merchantId);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create()", () => {
    it("should create a new customer", async () => {
      const customerRequest: CreateCustomerRequest = {
        email: "test@example.com",
        name: "John Doe",
        phone: "+1234567890",
        description: "Test customer",
        metadata: { tier: "premium" },
      };

      const mockResponse = {
        success: true,
        data: {
          id: "cust_123",
          email: "test@example.com",
          name: "John Doe",
          phone: "+1234567890",
          description: "Test customer",
          metadata: { tier: "premium" },
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await customersAPI.create(customerRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/customers`,
        customerRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it("should create customer with minimal required fields", async () => {
      const customerRequest: CreateCustomerRequest = {
        email: "minimal@example.com",
        name: "Jane Doe",
      };

      const mockResponse = {
        success: true,
        data: {
          id: "cust_456",
          email: "minimal@example.com",
          name: "Jane Doe",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await customersAPI.create(customerRequest);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/customers`,
        customerRequest
      );
      expect(result.data.email).toBe("minimal@example.com");
    });
  });

  describe("retrieve()", () => {
    it("should retrieve a customer by ID", async () => {
      const customerId = "cust_123";
      const mockResponse = {
        success: true,
        data: {
          id: customerId,
          email: "test@example.com",
          name: "John Doe",
          phone: "+1234567890",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await customersAPI.retrieve(customerId);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/customers/${customerId}`
      );
      expect(result).toEqual(mockResponse);
      expect(result.data.id).toBe(customerId);
    });
  });

  describe("update()", () => {
    it("should update a customer", async () => {
      const customerId = "cust_123";
      const updateData = {
        name: "John Updated",
        description: "Updated description",
      };

      const mockResponse = {
        success: true,
        data: {
          id: customerId,
          email: "test@example.com",
          name: "John Updated",
          phone: "+1234567890",
          description: "Updated description",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:01Z",
        },
      };

      mockClient.put.mockResolvedValue(mockResponse);

      const result = await customersAPI.update(customerId, updateData);

      expect(mockClient.put).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/customers/${customerId}`,
        updateData
      );
      expect(result.data.name).toBe("John Updated");
    });
  });

  describe("delete()", () => {
    it("should delete a customer", async () => {
      const customerId = "cust_123";
      const mockResponse = {
        success: true,
        data: { deleted: true },
      };

      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await customersAPI.delete(customerId);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/customers/${customerId}`
      );
      expect(result.data.deleted).toBe(true);
    });
  });

  describe("list()", () => {
    it("should list customers with default parameters", async () => {
      const mockResponse = {
        success: true,
        data: {
          customers: [
            {
              id: "cust_123",
              email: "test@example.com",
              name: "John Doe",
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          ],
          total: 1,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await customersAPI.list();

      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/customers`
      );
      expect(result).toEqual(mockResponse);
    });

    it("should list customers with query parameters", async () => {
      const params = {
        limit: 10,
        offset: 0,
        email: "test@example.com",
      };

      const mockResponse = {
        success: true,
        data: {
          customers: [],
          total: 0,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await customersAPI.list(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/v1/api/merchants/${merchantId}/customers?limit=10&offset=0&email=test%40example.com`
      );
    });

    it("should filter customers by date range", async () => {
      const params = {
        created_after: "2024-01-01",
        created_before: "2024-12-31",
      };

      const mockResponse = {
        success: true,
        data: {
          customers: [],
          total: 0,
          has_more: false,
        },
      };

      mockClient.get.mockResolvedValue(mockResponse);

      await customersAPI.list(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining("created_after=2024-01-01")
      );
      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining("created_before=2024-12-31")
      );
    });
  });
});
