/**
 * Complete Stripe Payment Integration Example
 * 
 * This example demonstrates how to accept Stripe payments through X-Pay as a payment aggregator.
 * X-Pay handles the Stripe integration - merchants just need to integrate with X-Pay.
 * 
 * Flow:
 * 1. Get X-Pay's Stripe publishable key from payment methods endpoint
 * 2. Backend creates payment intent via X-Pay API
 * 3. Frontend uses Stripe.js with X-Pay's publishable key to collect card details
 * 4. Customer pays through X-Pay's Stripe account
 * 5. X-Pay credits merchant's wallet after successful payment
 */

import XPay from '@bits-innovate/xpay-javascript';

// =============================================================================
// BACKEND: Node.js/Express Server
// =============================================================================

/**
 * Step 1: Initialize X-Pay SDK
 */
const xpay = new XPay({
  apiKey: process.env.XPAY_API_KEY!, // Your X-Pay API key (sk_live_xxx or sk_test_xxx)
  merchantId: process.env.XPAY_MERCHANT_ID!,
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
});

/**
 * Step 2: Get X-Pay's Stripe Configuration
 * Call this once on server startup or cache the result
 */
async function getStripePublishableKey(): Promise<string> {
  try {
    const paymentMethods = await xpay.payments.getPaymentMethods();
    
    if (!paymentMethods.data.stripe_config?.publishable_key) {
      throw new Error('Stripe configuration not available from X-Pay');
    }
    
    console.log('✅ Retrieved X-Pay Stripe publishable key');
    return paymentMethods.data.stripe_config.publishable_key;
  } catch (error) {
    console.error('❌ Failed to get Stripe config:', error);
    throw error;
  }
}

/**
 * Step 3: Backend Endpoint - Get Stripe Config
 * Endpoint: GET /api/stripe-config
 * Returns X-Pay's Stripe publishable key for frontend
 */
export async function handleGetStripeConfig(req: any, res: any) {
  try {
    const publishableKey = await getStripePublishableKey();
    
    res.json({
      success: true,
      publishableKey
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Step 4: Backend Endpoint - Create Payment Intent
 * Endpoint: POST /api/payments/create
 * Creates a payment intent via X-Pay and returns client secret for frontend
 */
export async function handleCreateStripePayment(req: any, res: any) {
  try {
    const { amount, currency, description, customer_id, metadata } = req.body;

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    console.log(`💳 Creating Stripe payment via X-Pay: ${amount} ${currency || 'USD'}`);

    // Create payment through X-Pay (which uses X-Pay's Stripe account)
    const payment = await xpay.payments.create({
      amount: amount.toString(),
      currency: currency || 'USD',
      payment_method: 'stripe',
      description: description || 'Payment via X-Pay',
      customer_id,
      payment_method_data: {
        payment_method_types: ['card'] // Support credit/debit cards
      },
      metadata: {
        ...metadata,
        order_id: metadata?.order_id || `order_${Date.now()}`,
        source: 'web_checkout'
      }
    });

    if (!payment.data.client_secret) {
      throw new Error('Failed to create payment intent - no client secret returned');
    }

    console.log(`✅ Payment intent created: ${payment.data.id}`);
    console.log(`📋 Client secret: ${payment.data.client_secret.substring(0, 20)}...`);

    // Return client secret to frontend
    res.json({
      success: true,
      data: {
        client_secret: payment.data.client_secret,
        payment_id: payment.data.id,
        amount: payment.data.amount,
        currency: payment.data.currency
      }
    });

  } catch (error: any) {
    console.error('❌ Payment creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment'
    });
  }
}

/**
 * Step 5: Backend Endpoint - Verify Payment Status
 * Endpoint: GET /api/payments/:paymentId/status
 * Checks payment status via X-Pay API
 */
export async function handleCheckPaymentStatus(req: any, res: any) {
  try {
    const { paymentId } = req.params;

    console.log(`🔍 Checking payment status: ${paymentId}`);

    const payment = await xpay.payments.retrieve(paymentId);

    console.log(`📊 Payment status: ${payment.data.status}`);

    res.json({
      success: true,
      data: {
        id: payment.data.id,
        status: payment.data.status,
        amount: payment.data.amount,
        currency: payment.data.currency,
        created_at: payment.data.created_at,
        updated_at: payment.data.updated_at
      }
    });

  } catch (error: any) {
    console.error('❌ Status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check payment status'
    });
  }
}

// =============================================================================
// FRONTEND: React/HTML Implementation
// =============================================================================

/**
 * Frontend Example (React with TypeScript)
 * 
 * Installation:
 * npm install @stripe/stripe-js @stripe/react-stripe-js
 */

/**
 * Step 1: Setup Stripe in your React app
 * File: src/components/StripePaymentForm.tsx
 */
const FRONTEND_EXAMPLE = `
import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Component to load Stripe with X-Pay's publishable key
export function StripePaymentWrapper() {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    // Fetch X-Pay's Stripe publishable key from your backend
    fetch('/api/stripe-config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('✅ Loaded X-Pay Stripe key');
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch(err => console.error('Failed to load Stripe config:', err));
  }, []);

  if (!stripePromise) {
    return <div>Loading payment form...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

// Payment form component
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment intent on your backend
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: '99.99',
          currency: 'USD',
          description: 'Premium subscription',
          metadata: {
            order_id: 'order_123',
            customer_email: 'customer@example.com'
          }
        })
      });

      const { data } = await response.json();

      if (!data.client_secret) {
        throw new Error('Failed to create payment');
      }

      console.log('💳 Confirming payment with Stripe...');

      // Step 2: Confirm payment with Stripe using client secret
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: 'Customer Name',
              email: 'customer@example.com'
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      console.log('✅ Payment successful!', paymentIntent.id);
      setSuccess(true);

      // Optional: Verify payment status with your backend
      const statusResponse = await fetch(\`/api/payments/\${data.payment_id}/status\`);
      const statusData = await statusResponse.json();
      console.log('📊 Payment status from X-Pay:', statusData.data.status);

    } catch (err: any) {
      console.error('❌ Payment failed:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>✅ Payment Successful!</h2>
        <p>Your payment has been processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' }
              },
              invalid: { color: '#9e2146' }
            }
          }}
        />
      </div>

      {error && (
        <div className="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay $99.99'}
      </button>
    </form>
  );
}
`;

/**
 * Alternative: Plain HTML/JavaScript Implementation
 * For non-React applications
 */
const HTML_EXAMPLE = `
<!DOCTYPE html>
<html>
<head>
  <title>X-Pay Stripe Payment</title>
  <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
  <form id="payment-form">
    <div id="card-element"></div>
    <div id="error-message"></div>
    <button id="submit-button">Pay $99.99</button>
  </form>

  <script>
    // Step 1: Get X-Pay's Stripe publishable key
    fetch('/api/stripe-config')
      .then(res => res.json())
      .then(data => {
        // Step 2: Initialize Stripe with X-Pay's key
        const stripe = Stripe(data.publishableKey);
        const elements = stripe.elements();
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');

        // Step 3: Handle form submission
        document.getElementById('payment-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          // Create payment intent via your backend
          const response = await fetch('/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: '99.99',
              currency: 'USD',
              description: 'Payment via X-Pay'
            })
          });

          const { data } = await response.json();

          // Confirm payment with Stripe
          const { error, paymentIntent } = await stripe.confirmCardPayment(
            data.client_secret,
            {
              payment_method: {
                card: cardElement,
                billing_details: { name: 'Customer Name' }
              }
            }
          );

          if (error) {
            document.getElementById('error-message').textContent = error.message;
          } else {
            alert('Payment successful!');
            console.log('Payment ID:', paymentIntent.id);
          }
        });
      });
  </script>
</body>
</html>
`;

// =============================================================================
// WEBHOOK HANDLING
// =============================================================================

/**
 * Handle Stripe webhook events from X-Pay
 * X-Pay forwards Stripe events to your webhook endpoint
 */
export async function handleStripeWebhook(req: any, res: any) {
  try {
    const event = req.body;

    console.log(`📬 Received webhook: ${event.type}`);

    switch (event.type) {
      case 'payment.succeeded':
        console.log('✅ Payment succeeded:', event.data.id);
        // Update your database, send confirmation email, etc.
        await handlePaymentSuccess(event.data);
        break;

      case 'payment.failed':
        console.log('❌ Payment failed:', event.data.id);
        await handlePaymentFailure(event.data);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook handler failed' });
  }
}

async function handlePaymentSuccess(payment: any) {
  // Implement your business logic
  console.log('Processing successful payment:', payment.id);
  // - Update order status in database
  // - Send confirmation email to customer
  // - Trigger fulfillment process
}

async function handlePaymentFailure(payment: any) {
  console.log('Processing failed payment:', payment.id);
  // - Notify customer
  // - Log failure for review
}

// =============================================================================
// SUMMARY
// =============================================================================

console.log(`
✅ Complete Stripe Integration Flow:

1. BACKEND SETUP:
   - Initialize X-Pay SDK with your API key
   - Fetch X-Pay's Stripe publishable key: GET /payment-methods
   - Expose endpoint to provide publishable key to frontend
   - Create payment intent endpoint: POST /api/payments/create
   - Implement webhook handler for payment status updates

2. FRONTEND SETUP:
   - Install @stripe/stripe-js
   - Fetch publishable key from your backend
   - Initialize Stripe with X-Pay's publishable key
   - Use Stripe Elements to collect card details
   - Confirm payment with client secret

3. PAYMENT FLOW:
   - Customer enters card on your frontend
   - Payment processed through X-Pay's Stripe account
   - X-Pay credits your merchant wallet
   - Webhook confirms payment success

4. KEY BENEFITS:
   ✓ Single integration point (X-Pay)
   ✓ PCI compliance handled by Stripe
   ✓ No Stripe account needed for merchants
   ✓ Automatic wallet crediting by X-Pay
`);

export default {
  handleGetStripeConfig,
  handleCreateStripePayment,
  handleCheckPaymentStatus,
  handleStripeWebhook
};
