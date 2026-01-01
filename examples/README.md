# X-Pay SDK Examples

This directory contains practical examples demonstrating how to use the X-Pay JavaScript SDK for various payment scenarios.

## Examples

### [orange-payment.ts](./orange-payment.ts) - Orange Money Complete Flow

Complete Orange Money (Liberia) payment flow demonstration:

- Creating an Orange Money payment
- Polling for payment status (async payment handling)
- Extracting Orange Money reference ID for tracking
- Handling payment success/failure scenarios
- Manual status checking as an alternative to polling

**Run the example:**

```bash
# Set environment variables
export XPAY_API_KEY="sk_live_your_key_here"
export XPAY_MERCHANT_ID="your_merchant_id_here"

# Run with ts-node
npx ts-node examples/orange-payment.ts
```

### [stripe-payment-complete.ts](./stripe-payment-complete.ts) - Complete Stripe Integration

**Most Comprehensive Example** - Full Stripe payment integration showing:

- Backend setup with X-Pay SDK
- Getting X-Pay's Stripe publishable key
- Creating payment intents via X-Pay
- Complete frontend integration (React + HTML examples)
- Stripe.js setup and card collection
- Payment confirmation flow
- Webhook handling for payment events

**Key Features:**
- X-Pay as payment aggregator (merchants use X-Pay's Stripe account)
- PCI compliance through Stripe Elements
- No merchant Stripe account needed
- Automatic wallet crediting

### [Basic Payment Processing](./basic-payment.js)

Simple payment creation and retrieval

### [Payment Methods](./payment-methods.js)

Getting available payment methods

### [Webhooks Management](./webhooks.js)

Creating and managing webhook endpoints

### [TypeScript Usage](./typescript-example.ts)

TypeScript integration examples

## Running Examples

Each example can be run independently. Make sure to:

1. Install dependencies: `npm install`
2. Set your API key in the example file
3. Run with Node.js: `node examples/basic-payment.js`

For TypeScript examples:
```bash
npm run build
node dist/examples/typescript-example.js
```
