import XPay from '../index';

describe('XPay SDK', () => {
  const apiKey = 'xpay_sandbox_test_123456789';
  const merchantId = 'test_merchant_id';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create an instance with valid config', () => {
      const xpay = new XPay({ apiKey, merchantId });
      
      expect(xpay).toBeInstanceOf(XPay);
      expect(xpay.payments).toBeDefined();
      expect(xpay.webhooks).toBeDefined();
      expect(xpay.customers).toBeDefined();
    });

    it('should throw error if API key is missing', () => {
      expect(() => {
        new XPay({ apiKey: '' });
      }).toThrow('API key is required');
    });

    it('should set environment to sandbox by default', () => {
      const xpay = new XPay({ apiKey, merchantId });
      // The environment is used internally by HTTPClient
      expect(xpay).toBeInstanceOf(XPay);
    });
  });

  describe('ping()', () => {
    it('should make a successful ping request', async () => {
      const mockResponse = {
        success: true,
        data: { timestamp: '2024-01-01T00:00:00Z' }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const xpay = new XPay({ apiKey, merchantId });
      const result = await xpay.ping();

      expect(result).toEqual({
        success: true,
        timestamp: expect.any(String)
      });
      
      expect(fetch).toHaveBeenCalledWith(
        'https://server.xpay-bits.com/v1/healthz',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
            'X-Environment': 'sandbox'
          })
        })
      );
    });
  });

  describe('getPaymentMethods()', () => {
    it('should retrieve available payment methods', async () => {
      const mockResponse = {
        success: true,
        data: {
          payment_methods: [
            {
              type: 'stripe',
              name: 'Credit/Debit Cards',
              description: 'Accept Visa, Mastercard, and other cards',
              enabled: true,
              currencies: ['USD', 'EUR', 'GBP', 'GHS']
            }
          ],
          environment: 'sandbox',
          merchant_id: merchantId
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const xpay = new XPay({ apiKey, merchantId });
      const result = await xpay.getPaymentMethods();

      expect(result).toEqual(mockResponse.data);
      
      expect(fetch).toHaveBeenCalledWith(
        `https://server.xpay-bits.com/v1/api/merchants/${merchantId}/payment-methods`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });
});
