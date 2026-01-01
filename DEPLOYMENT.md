# X-Pay JavaScript SDK - Deployment Guide

## Quick Start with Deployed Server

The X-Pay backend is now deployed and accessible at **`https://server.xpay-bits.com`**

### Installation

```bash
npm install @xpay/javascript-sdk
```

### Basic Usage

```javascript
import XPay from '@xpay/javascript-sdk';

const xpay = new XPay({
  apiKey: 'sk_sandbox_your_api_key',
  merchantId: 'your_merchant_id',
  environment: 'sandbox',
  baseUrl: 'https://server.xpay-bits.com'  // Production server
});

// Create a payment
const payment = await xpay.payments.create({
  amount: '10.00',
  currency: 'USD',
  payment_method: 'stripe',
  description: 'Test payment'
});

console.log('Payment created:', payment.data);
```

## Testing the SDK

### Option 1: Quick Test Script

```bash
cd integrations/sdks/javascript

# Set your credentials
export XPAY_API_KEY="sk_sandbox_your_actual_key"
export XPAY_MERCHANT_ID="your_merchant_id"

# Run comprehensive tests
node test-deployed-server.js
```

### Option 2: Manual Testing

```javascript
const XPay = require('@xpay/javascript-sdk');

const xpay = new XPay({
  apiKey: process.env.XPAY_API_KEY,
  merchantId: process.env.XPAY_MERCHANT_ID,
  environment: 'sandbox',
  baseUrl: 'https://server.xpay-bits.com'
});

// Test connection
const health = await xpay.ping();
console.log('Server health:', health);

// Get payment methods
const methods = await xpay.getPaymentMethods();
console.log('Available payment methods:', methods);
```

## Environment Configuration

### Sandbox (Testing)
```javascript
const xpay = new XPay({
  apiKey: 'sk_sandbox_...',      // Sandbox API key
  merchantId: 'merchant_id',
  environment: 'sandbox',
  baseUrl: 'https://server.xpay-bits.com'
});
```

### Live (Production)
```javascript
const xpay = new XPay({
  apiKey: 'sk_live_...',         // Live API key
  merchantId: 'merchant_id',
  environment: 'live',
  baseUrl: 'https://server.xpay-bits.com'
});
```

## Available Features

### ✅ Payments
- Create payments (Stripe, Mobile Money, Orange Money, Wallets)
- Retrieve payment status
- List payments with filters
- Cancel payments
- Confirm payments

### ✅ Customers
- Create customers
- Update customer information
- List customers
- Retrieve customer details

### ✅ Webhooks
- Create webhook endpoints
- List webhooks
- Update webhook configuration
- Test webhooks
- Verify webhook signatures

### ✅ Payment Methods
- Stripe (Credit/Debit Cards)
- MTN Mobile Money (Ghana, Liberia, Nigeria, Uganda, Rwanda)
- Orange Money (Liberia) - **NEW**
- X-Pay Wallets

## Payment Examples

### Stripe Payment
```javascript
const payment = await xpay.payments.create({
  amount: '99.99',
  currency: 'USD',
  payment_method: 'stripe',
  description: 'Premium subscription',
  payment_method_data: {
    payment_method_types: ['card']
  }
});

// Use client_secret with Stripe Elements
console.log('Client secret:', payment.data.client_secret);
```

### Mobile Money Payment (Ghana)
```javascript
const payment = await xpay.payments.create({
  amount: '50.00',
  currency: 'GHS',
  payment_method: 'momo',
  description: 'Mobile money payment',
  payment_method_data: {
    phone_number: '+233123456789'
  }
});

console.log('Reference ID:', payment.data.reference_id);
console.log('Instructions:', payment.data.instructions);
```

### Orange Money Payment (Liberia)
```javascript
const payment = await xpay.payments.create({
  amount: '25.00',
  currency: 'LRD',
  payment_method: 'orange',
  description: 'Orange Money payment',
  payment_method_data: {
    phone_number: '+231123456789'
  }
});

console.log('Transaction status:', payment.data.status);
```

### X-Pay Wallet Payment
```javascript
const payment = await xpay.payments.create({
  amount: '15.50',
  currency: 'USD',
  payment_method: 'xpay_wallet',
  payment_method_data: {
    wallet_id: 'wallet_abc123',
    pin: '1234'
  }
});
```

## Testing Checklist

Run the comprehensive test suite to verify all features:

```bash
# 1. Install dependencies
npm install

# 2. Build the SDK
npm run build

# 3. Set credentials
export XPAY_API_KEY="sk_sandbox_your_key"
export XPAY_MERCHANT_ID="your_merchant_id"

# 4. Run tests
node test-deployed-server.js
```

Expected test results:
- ✓ Health Check
- ✓ Get Payment Methods
- ✓ Create Stripe Payment
- ✓ Create Mobile Money Payment
- ✓ List Payments
- ✓ Create Customer
- ✓ List Customers
- ✓ Create Webhook

## Error Handling

```javascript
import { XPayError } from '@xpay/javascript-sdk';

try {
  const payment = await xpay.payments.create(paymentData);
} catch (error) {
  if (error instanceof XPayError) {
    console.error('API Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
    console.error('Details:', error.details);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR` - Invalid API key
- `INVALID_PAYMENT_METHOD` - Unsupported payment method
- `INVALID_CURRENCY` - Currency not supported
- `VALIDATION_ERROR` - Invalid request parameters
- `NETWORK_ERROR` - Connection issues
- `TIMEOUT` - Request timeout

## API Endpoints

The SDK automatically uses the correct endpoints:

| Resource | Endpoint |
|----------|----------|
| Health Check | `GET /v1/healthz` |
| Payment Methods | `GET /v1/api/merchants/{id}/payment-methods` |
| Create Payment | `POST /v1/api/merchants/{id}/payments` |
| Get Payment | `GET /v1/api/merchants/{id}/payments/{paymentId}` |
| List Payments | `GET /v1/api/merchants/{id}/payments` |
| Create Customer | `POST /v1/api/merchants/{id}/customers` |
| Create Webhook | `POST /v1/api/merchants/{id}/webhooks` |

## Getting Credentials

1. **Register Account**: Visit the X-Pay developer dashboard
2. **Create Merchant**: Complete merchant setup
3. **Generate API Keys**: Get sandbox and live API keys
4. **Get Merchant ID**: Copy from dashboard

## Production Deployment

### Environment Variables

```bash
# .env file
XPAY_API_KEY=sk_live_your_production_key
XPAY_MERCHANT_ID=your_merchant_id
XPAY_ENVIRONMENT=live
XPAY_BASE_URL=https://server.xpay-bits.com
```

### Usage in Node.js

```javascript
require('dotenv').config();

const xpay = new XPay({
  apiKey: process.env.XPAY_API_KEY,
  merchantId: process.env.XPAY_MERCHANT_ID,
  environment: process.env.XPAY_ENVIRONMENT,
  baseUrl: process.env.XPAY_BASE_URL
});
```

### Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all credentials
3. **Verify webhook signatures** before processing
4. **Use HTTPS only** in production
5. **Rotate API keys** regularly
6. **Monitor API usage** for anomalies

## Webhook Verification

```javascript
import { WebhooksAPI } from '@xpay/javascript-sdk';

// In your webhook handler
app.post('/webhooks/xpay', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;

  const isValid = await WebhooksAPI.verifySignature(
    payload,
    signature,
    secret
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook event
  const event = req.body;
  console.log('Webhook event:', event.type);

  res.status(200).send('OK');
});
```

## Support

- **Server**: https://server.xpay-bits.com
- **Documentation**: https://docs.x-pay.com
- **Issues**: https://github.com/Sound-X-Team/x-pay-integrations/issues
- **Email**: dev@x-pay.com

## Next Steps

1. ✅ SDK is built and ready to use
2. ✅ Server is deployed at server.xpay-bits.com
3. ✅ Orange Money integration is complete
4. 🔄 Get your API credentials from developer dashboard
5. 🔄 Run test-deployed-server.js to verify everything works
6. 🔄 Integrate into your application

## Changelog

### v1.0.0 (Current)
- ✅ Full TypeScript support
- ✅ Stripe payments
- ✅ Mobile Money (Ghana, Liberia, Nigeria, Uganda, Rwanda)
- ✅ Orange Money (Liberia)
- ✅ X-Pay Wallets
- ✅ Customer management
- ✅ Webhook management
- ✅ Webhook signature verification
- ✅ Currency utilities
- ✅ Comprehensive error handling
- ✅ Environment detection from API keys
- ✅ Built-in retry logic
- ✅ Request timeout handling
