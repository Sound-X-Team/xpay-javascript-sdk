# X-Pay JavaScript SDK

[![npm version](https://badge.fury.io/js/@xpay%2Fjavascript-sdk.svg)](https://badge.fury.io/js/@xpay%2Fjavascript-sdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official JavaScript/TypeScript SDK for X-Pay payment processing platform. Accept payments from multiple providers including Stripe, Mobile Money, and X-Pay Wallets with a unified API.

## Features

- 🚀 **Multiple Payment Methods**: Stripe, Mobile Money (MoMo), X-Pay Wallets
- 🔒 **Secure**: Built-in signature verification for webhooks
- 📱 **Universal**: Works in Node.js and modern browsers
- 🎯 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🌍 **Multi-Currency**: Support for multiple currencies and regions
- 👥 **Customer Management**: Complete customer lifecycle management
- 🔗 **Webhook Management**: Easy webhook setup and verification
- 📊 **Developer-Friendly**: Comprehensive error handling and debugging tools

## Installation

```bash
npm install @xpay/javascript-sdk
```

```bash
yarn add @xpay/javascript-sdk
```

## Quick Start

```javascript
import XPay from '@xpay/javascript-sdk';

// Initialize the SDK
const xpay = new XPay({
  apiKey: 'xpay_sandbox_test_your_api_key_here',
  merchantId: 'your_merchant_id_here',
  environment: 'sandbox',
  baseUrl: 'http://localhost:8000' // For local development
});

// Create a payment
const payment = await xpay.payments.create({
  amount: '10.00',        // Amount as string
  currency: 'USD',
  payment_method: 'stripe',
  description: 'Test payment'
});

console.log('Payment created:', payment.data);
```

## Development Setup

### Running with Local Backend

When developing with the X-Pay backend running locally:

```javascript
const xpay = new XPay({
  apiKey: 'xpay_sandbox_test_your_api_key_here',     // Get from developer dashboard
  merchantId: 'your_merchant_id_here',               // Your merchant ID
  environment: 'sandbox',
  baseUrl: 'http://localhost:8000'                   // Local backend URL
});

// Test connectivity
const ping = await xpay.ping();
console.log('Backend connected:', ping.success);
```

### Prerequisites

1. **Backend Running**: Start the X-Pay backend on `http://localhost:8000`
2. **Developer Account**: Register at the developer dashboard to get API keys
3. **Merchant Setup**: Complete merchant setup to get merchant ID

## API Reference

### Configuration

```javascript
const xpay = new XPay({
  apiKey: 'xpay_sandbox_test_key',    // Required: Your X-Pay API key
  merchantId: 'merchant_123',         // Required: Your merchant ID  
  environment: 'sandbox',             // Optional: 'sandbox' or 'live'
  baseUrl: 'http://localhost:8000',   // Optional: Custom API base URL
  timeout: 30000                      // Optional: Request timeout in ms
});
```

### Payments API

#### Create Payment

```javascript
const payment = await xpay.payments.create({
  amount: '25.99',                     // Required: Amount as string
  currency: 'USD',                     // Optional: Auto-assigned if not provided
  payment_method: 'stripe',            // Required: Payment method
  description: 'Order #12345',         // Optional: Payment description
  customer_id: 'cust_123',            // Optional: Customer identifier
  payment_method_data: {              // Optional: Method-specific data
    // For Stripe
    payment_method_types: ['card'],
    
    // For Mobile Money
    phone_number: '+233123456789',
    
    // For X-Pay Wallet  
    wallet_id: 'wallet_123',
    pin: '1234'
  },
  metadata: {                         // Optional: Custom metadata
    order_id: '12345',
    user_id: 'user_456'
  },
  success_url: 'https://your-site.com/success',  // Optional
  cancel_url: 'https://your-site.com/cancel',    // Optional
  webhook_url: 'https://your-site.com/webhook'   // Optional
});
```

#### Supported Payment Methods

- `stripe` - Credit/debit cards via Stripe
- `momo` - Mobile Money (Ghana)
- `momo_liberia` - Mobile Money (Liberia)  
- `momo_nigeria` - Mobile Money (Nigeria)
- `momo_uganda` - Mobile Money (Uganda)
- `momo_rwanda` - Mobile Money (Rwanda)
- `wallet` - X-Pay Wallet
- `xpay_wallet` - X-Pay Wallet (alias)

#### Retrieve Payment

```javascript
const payment = await xpay.payments.retrieve('pay_123456789');
```

#### List Payments

```javascript
const payments = await xpay.payments.list({
  limit: 10,
  offset: 0,
  status: 'succeeded',
  customer_id: 'cust_123',
  created_after: '2024-01-01',
  created_before: '2024-12-31'
});
```

### Customer Management

#### Create Customer

```javascript
const customer = await xpay.customers.create({
  email: 'customer@example.com',      // Required
  name: 'John Doe',                   // Required
  phone: '+1234567890',               // Optional
  description: 'Premium customer',     // Optional
  metadata: {                         // Optional
    tier: 'premium',
    signup_source: 'website'
  }
});
```

#### Update Customer

```javascript
const updatedCustomer = await xpay.customers.update('cust_123', {
  name: 'Jane Doe',
  description: 'Updated customer info'
});
```

#### List Customers

```javascript
const customers = await xpay.customers.list({
  limit: 50,
  offset: 0,
  email: 'john@example.com',          // Filter by email
  created_after: '2024-01-01'
});
```

### Webhooks API

#### Create Webhook

```javascript
const webhook = await xpay.webhooks.create({
  url: 'https://your-app.com/webhooks/xpay',
  events: [
    'payment.succeeded',
    'payment.failed',
    'customer.created'
  ],
  description: 'Main webhook endpoint'
});
```

#### Verify Webhook Signature

```javascript
import { WebhooksAPI } from '@xpay/javascript-sdk';

const isValid = await WebhooksAPI.verifySignature(
  webhookPayload,      // Raw webhook body as string
  webhookSignature,    // X-Webhook-Signature header
  webhookSecret        // Your webhook secret
);

if (isValid) {
  const event = JSON.parse(webhookPayload);
  console.log('Valid webhook event:', event);
}
```

#### Supported Webhook Events

- `payment.created` - Payment was created
- `payment.succeeded` - Payment completed successfully  
- `payment.failed` - Payment failed to process
- `payment.cancelled` - Payment was cancelled
- `payment.refunded` - Payment was refunded
- `refund.created` - Refund was initiated
- `refund.succeeded` - Refund completed successfully
- `refund.failed` - Refund failed
- `customer.created` - Customer was created
- `customer.updated` - Customer was modified

## Payment Examples

### Stripe Payment

X-Pay acts as a payment aggregator for Stripe - merchants process payments through X-Pay's Stripe account. See [examples/stripe-payment-complete.ts](./examples/stripe-payment-complete.ts) for a complete implementation guide.

**Step 1: Get X-Pay's Stripe Publishable Key**

```javascript
// Backend: Get X-Pay's Stripe configuration
const paymentMethods = await xpay.payments.getPaymentMethods();
const stripePublishableKey = paymentMethods.data.stripe_config?.publishable_key;

// Expose this to your frontend
app.get('/api/stripe-config', (req, res) => {
  res.json({ publishableKey: stripePublishableKey });
});
```

**Step 2: Create Payment Intent (Backend)**

```javascript
const stripePayment = await xpay.payments.create({
  amount: '99.99',
  currency: 'USD',
  payment_method: 'stripe',
  description: 'Premium subscription',
  payment_method_data: {
    payment_method_types: ['card']
  }
});

// Return client_secret to frontend
res.json({ clientSecret: stripePayment.data.client_secret });
```

**Step 3: Confirm Payment (Frontend with Stripe.js)**

```javascript
// Install: npm install @stripe/stripe-js
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with X-Pay's publishable key
const stripe = await loadStripe('pk_live_xpay_key_from_step1');

// Confirm payment
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement, // Stripe Card Element
    billing_details: { name: 'Customer Name' }
  }
});
```

> **Note:** Complete React and HTML examples available in [examples/stripe-payment-complete.ts](./examples/stripe-payment-complete.ts)

### Mobile Money Payment

```javascript
const momoPayment = await xpay.payments.create({
  amount: '50.00',
  currency: 'GHS',
  payment_method: 'momo',
  description: 'Mobile Money payment',
  payment_method_data: {
    phone_number: '+233123456789'
  }
});

if (momoPayment.data.reference_id) {
  console.log('Reference ID:', momoPayment.data.reference_id);
}

if (momoPayment.data.instructions) {
  console.log('Payment instructions:', momoPayment.data.instructions);
}
```

### Orange Money Payment (Liberia)

```javascript
// Create Orange Money payment
const orangePayment = await xpay.payments.create({
  amount: '10.00',
  currency: 'LRD',  // or 'USD'
  payment_method: 'orange',
  description: 'Subscription payment',
  payment_method_data: {
    phone_number: '+231779880047'  // Liberia format
  },
  metadata: {
    subscription_id: 'sub_123',
    user_id: 'user_456'
  }
});

console.log('Payment ID:', orangePayment.data.id);
console.log('Orange Reference:', orangePayment.data.reference_id);
console.log('Initial Status:', orangePayment.data.status); // 'pending'

// Poll for payment status (Orange Money is asynchronous)
try {
  const finalPayment = await xpay.payments.pollPaymentStatus(
    orangePayment.data.id,
    {
      maxAttempts: 30,      // Poll up to 30 times
      intervalMs: 2000,     // Wait 2 seconds between attempts
      finalStatuses: ['succeeded', 'completed', 'failed', 'cancelled']
    }
  );

  if (finalPayment.status === 'succeeded' || finalPayment.status === 'completed') {
    console.log('✅ Payment successful!');
    console.log('Reference ID:', finalPayment.reference_id);
    // Activate subscription, grant access, etc.
  } else {
    console.log('❌ Payment failed:', finalPayment.status);
    // Handle failed payment
  }
} catch (error) {
  console.error('Payment polling timeout or error:', error);
}
```

### Alternative: Manual Status Checking

```javascript
// Create payment
const payment = await xpay.payments.create({
  amount: '5.00',
  currency: 'LRD',
  payment_method: 'orange',
  payment_method_data: {
    phone_number: '+231779880047'
  }
});

// Check status manually
const currentStatus = await xpay.payments.retrieve(payment.data.id);
console.log('Current status:', currentStatus.data.status);
console.log('Orange Reference:', currentStatus.data.reference_id);

// Check again after user completes payment on their phone
setTimeout(async () => {
  const updatedStatus = await xpay.payments.retrieve(payment.data.id);
  console.log('Updated status:', updatedStatus.data.status);
}, 10000); // Check after 10 seconds
```

### X-Pay Wallet Payment

```javascript
const walletPayment = await xpay.payments.create({
  amount: '15.50',
  currency: 'USD',
  payment_method: 'xpay_wallet',
  payment_method_data: {
    wallet_id: 'wallet_abc123',
    pin: '1234'
  }
});
```

## Error Handling

```javascript
import { XPayError } from '@xpay/javascript-sdk';

try {
  const payment = await xpay.payments.create(paymentData);
} catch (error) {
  if (error instanceof XPayError) {
    console.error('X-Pay API Error:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Status:', error.status);
    console.error('- Details:', error.details);
  } else {
    console.error('Network/Other Error:', error.message);
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR` - Invalid API key or expired token
- `INVALID_PAYMENT_METHOD` - Unsupported payment method
- `INVALID_CURRENCY` - Currency not supported for payment method
- `VALIDATION_ERROR` - Missing or invalid request parameters
- `NETWORK_ERROR` - Network connectivity issues
- `TIMEOUT` - Request timeout

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import XPay, { PaymentRequest, Payment, Customer, XPayError } from '@xpay/javascript-sdk';

const xpay = new XPay({
  apiKey: process.env.XPAY_API_KEY!,
  merchantId: process.env.XPAY_MERCHANT_ID!,
  environment: 'sandbox'
});

// Type-safe payment creation
const paymentRequest: PaymentRequest = {
  amount: '29.99',
  currency: 'USD',
  payment_method: 'stripe',
  description: 'TypeScript payment'
};

try {
  const response = await xpay.payments.create(paymentRequest);
  const payment: Payment = response.data;
  
  console.log(`Payment ${payment.id} created with status ${payment.status}`);
} catch (error: unknown) {
  if (error instanceof XPayError) {
    console.error(`API Error [${error.code}]: ${error.message}`);
  }
}
```

## Testing

### Running the Example

```bash
cd integrations/sdks/javascript

# Install dependencies
npm install

# Build the SDK
npm run build

# Run the basic JavaScript example
node examples/basic-payment.js

# Run the TypeScript example
npx ts-node examples/typescript-example.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Examples

Check out the [examples directory](./examples/) for complete usage examples:

- [Basic Payment Processing](./examples/basic-payment.js) - JavaScript examples
- [TypeScript Usage](./examples/typescript-example.ts) - TypeScript examples with advanced patterns
- [Payment Methods](./examples/payment-methods.js) - Different payment method examples
- [Webhooks](./examples/webhooks.js) - Webhook management examples

## Local Development with Backend

1. **Start Backend**: Run the X-Pay backend on `http://localhost:8000`
2. **Get API Keys**: Register developer account and get sandbox API keys
3. **Update Examples**: Replace placeholder API keys in examples
4. **Test SDK**: Run examples to test against local backend

```bash
# Example workflow
cd integrations/sdks/javascript
npm install
npm run build

# Update examples/basic-payment.js with your API keys
node examples/basic-payment.js
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: dev@x-pay.com
- 📖 Documentation: https://docs.x-pay.com
- 💬 GitHub Issues: https://github.com/Sound-X-Team/x-pay-integrations/issues
