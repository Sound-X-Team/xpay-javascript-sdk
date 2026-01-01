import { PaymentsAPI } from '../payments';
import { HTTPClient } from '../http';
import { PaymentRequest } from '../types';

// Mock HTTPClient
jest.mock('../http');

describe('PaymentsAPI', () => {
  let paymentsAPI: PaymentsAPI;
  let mockClient: jest.Mocked<HTTPClient>;
  const merchantId = 'test_merchant_123';

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn()
    } as any;
    
    paymentsAPI = new PaymentsAPI(mockClient, merchantId);
  });

  describe('create()', () => {
    it('should create a payment', async () => {
      const paymentRequest: PaymentRequest = {
        amount: '10.00',
        currency: 'USD',
        payment_method: 'stripe',
        description: 'Test payment'
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'pay_123',
          status: 'pending',
          ...paymentRequest,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await paymentsAPI.create(paymentRequest);

      expect(mockClient.post).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payments`, paymentRequest);
      expect(result).toEqual(mockResponse);
    });

    it('should auto-assign currency if not provided', async () => {
      const paymentRequest: PaymentRequest = {
        amount: '10.00',
        payment_method: 'stripe',
        description: 'Test payment'
      };

      const expectedRequest = { ...paymentRequest, currency: 'USD' };

      const mockResponse = {
        success: true,
        data: {
          id: 'pay_123',
          status: 'pending',
          ...expectedRequest,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      mockClient.post.mockResolvedValue(mockResponse);

      await paymentsAPI.create(paymentRequest);

      expect(mockClient.post).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payments`, expectedRequest);
    });
  });

  describe('retrieve()', () => {
    it('should retrieve a payment by ID', async () => {
      const paymentId = 'pay_123';
      const mockResponse = {
        success: true,
        data: {
          id: paymentId,
          status: 'completed',
          amount: '10.00',
          currency: 'USD',
          payment_method: 'stripe',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentsAPI.retrieve(paymentId);

      expect(mockClient.get).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payments/${paymentId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('list()', () => {
    it('should list payments with default parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [],
          total: 0
        }
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentsAPI.list();

      expect(mockClient.get).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payments`);
      expect(result).toEqual(mockResponse);
    });

    it('should list payments with query parameters', async () => {
      const params = {
        limit: 10,
        offset: 0,
        status: 'completed'
      };

      const mockResponse = {
        success: true,
        data: {
          payments: [],
          total: 0
        }
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentsAPI.list(params);

      expect(mockClient.get).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payments?limit=10&offset=0&status=completed`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancel()', () => {
    it('should cancel a payment', async () => {
      const paymentId = 'pay_123';
      const mockResponse = {
        success: true,
        data: {
          id: paymentId,
          status: 'cancelled',
          amount: '10.00',
          currency: 'USD',
          payment_method: 'stripe',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      };

      mockClient.post.mockResolvedValue(mockResponse);

      const result = await paymentsAPI.cancel(paymentId);

      expect(mockClient.post).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payments/${paymentId}/cancel`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPaymentMethods()', () => {
    it('should get payment methods without country', async () => {
      const mockResponse = {
        success: true,
        data: {
          available_methods: [
            {
              type: 'stripe',
              display_name: 'Credit Card',
              currencies: ['USD', 'EUR'],
              description: 'Pay with credit or debit card'
            }
          ],
          country: 'US',
          default_currency: 'USD'
        }
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentMethods();

      expect(mockClient.get).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payment-methods`);
      expect(result).toEqual(mockResponse);
    });

    it('should get payment methods for specific country', async () => {
      const country = 'GH';
      const mockResponse = {
        success: true,
        data: {
          available_methods: [
            {
              type: 'momo',
              display_name: 'Mobile Money',
              currencies: ['GHS'],
              description: 'Pay with mobile money'
            }
          ],
          country: 'GH',
          default_currency: 'GHS'
        }
      };

      mockClient.get.mockResolvedValue(mockResponse);

      const result = await paymentsAPI.getPaymentMethods(country);

      expect(mockClient.get).toHaveBeenCalledWith(`/v1/api/merchants/${merchantId}/payment-methods?country=${country}`);
      expect(result).toEqual(mockResponse);
    });
  });
});
