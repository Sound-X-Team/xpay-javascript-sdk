/**
 * Orange Money Payment Example
 * 
 * This example demonstrates how to:
 * 1. Create an Orange Money payment (Liberia)
 * 2. Poll for payment status (Orange Money is asynchronous)
 * 3. Handle successful and failed payments
 * 4. Access the Orange Money reference ID for tracking
 */

import XPay from '@bits-innovate/xpay-javascript';

// Initialize X-Pay SDK
const xpay = new XPay({
  apiKey: process.env.XPAY_API_KEY || 'sk_live_your_secret_key_here',
  merchantId: process.env.XPAY_MERCHANT_ID || 'your_merchant_id_here',
  environment: 'live',  // or 'sandbox' for testing
  baseUrl: process.env.XPAY_BASE_URL || 'https://server.xpay-bits.com'
});

async function createOrangePayment() {
  try {
    console.log('🍊 Creating Orange Money payment...\n');

    // Create the payment
    const payment = await xpay.payments.create({
      amount: '10.00',                    // Amount in LRD or USD
      currency: 'LRD',                    // Liberian Dollar (or 'USD')
      payment_method: 'orange',           // Orange Money
      description: 'Subscription renewal',
      payment_method_data: {
        phone_number: '+231779880047'     // Liberia phone format
      },
      metadata: {
        subscription_id: 'sub_12345',
        user_id: 'user_67890',
        plan: 'premium_monthly'
      }
    });

    console.log('✅ Payment created successfully!');
    console.log('Payment ID:', payment.data.id);
    console.log('Orange Reference:', payment.data.reference_id);
    console.log('Status:', payment.data.status);
    console.log('Amount:', payment.data.amount, payment.data.currency);
    console.log('\n📱 Customer will receive Orange Money prompt on their phone...\n');

    return payment.data;

  } catch (error: any) {
    console.error('❌ Payment creation failed:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    throw error;
  }
}

async function pollPaymentStatus(paymentId: string) {
  try {
    console.log('⏳ Polling payment status (this may take 30-60 seconds)...\n');

    // Use the built-in polling method
    const finalPayment = await xpay.payments.pollPaymentStatus(paymentId, {
      maxAttempts: 30,        // Poll up to 30 times
      intervalMs: 2000,       // Wait 2 seconds between attempts (60 seconds total)
      finalStatuses: ['succeeded', 'completed', 'failed', 'cancelled']
    });

    console.log('🎯 Final payment status received!');
    console.log('Status:', finalPayment.status);
    console.log('Orange Reference:', finalPayment.reference_id);
    console.log('Payment ID:', finalPayment.id);

    return finalPayment;

  } catch (error: any) {
    if (error.code === 'POLLING_TIMEOUT') {
      console.log('⏱️  Polling timeout - payment still processing');
      console.log('You can check status later or wait for webhook notification');
      
      // Get last known status
      const lastStatus = await xpay.payments.retrieve(paymentId);
      return lastStatus.data;
    }
    throw error;
  }
}

async function handlePaymentResult(payment: any) {
  console.log('\n' + '='.repeat(50));
  
  if (payment.status === 'succeeded' || payment.status === 'completed') {
    console.log('✅ PAYMENT SUCCESSFUL!');
    console.log('='.repeat(50));
    console.log('Payment ID:', payment.id);
    console.log('Orange Reference:', payment.reference_id);
    console.log('Amount:', payment.amount, payment.currency);
    
    // Your business logic here
    console.log('\n📝 Next steps:');
    console.log('- Activate user subscription');
    console.log('- Send confirmation email/SMS');
    console.log('- Update database records');
    console.log('- Generate receipt');
    
    return true;
    
  } else if (payment.status === 'failed') {
    console.log('❌ PAYMENT FAILED');
    console.log('='.repeat(50));
    console.log('Payment ID:', payment.id);
    console.log('Status:', payment.status);
    
    console.log('\n📝 Next steps:');
    console.log('- Notify user of failure');
    console.log('- Offer alternative payment methods');
    console.log('- Log failure for support team');
    
    return false;
    
  } else {
    console.log('⏳ PAYMENT STILL PROCESSING');
    console.log('='.repeat(50));
    console.log('Payment ID:', payment.id);
    console.log('Current status:', payment.status);
    console.log('\n💡 Consider setting up webhooks for automatic notifications');
    
    return null;
  }
}

async function manualStatusCheck(paymentId: string) {
  try {
    console.log('🔍 Checking payment status manually...\n');
    
    const payment = await xpay.payments.retrieve(paymentId);
    
    console.log('Payment Details:');
    console.log('- ID:', payment.data.id);
    console.log('- Status:', payment.data.status);
    console.log('- Orange Reference:', payment.data.reference_id);
    console.log('- Amount:', payment.data.amount, payment.data.currency);
    console.log('- Created:', new Date(payment.data.created_at).toLocaleString());
    console.log('- Updated:', new Date(payment.data.updated_at).toLocaleString());
    
    if (payment.data.metadata) {
      console.log('- Metadata:', payment.data.metadata);
    }
    
    return payment.data;
    
  } catch (error: any) {
    console.error('❌ Status check failed:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Orange Money Payment Example\n');
  console.log('='.repeat(50) + '\n');

  try {
    // Step 1: Create payment
    const payment = await createOrangePayment();
    
    // Step 2: Poll for status
    const finalPayment = await pollPaymentStatus(payment.id);
    
    // Step 3: Handle result
    await handlePaymentResult(finalPayment);

    // Example: Manual status check (alternative to polling)
    console.log('\n\n📖 Alternative: Manual Status Check Example\n');
    await manualStatusCheck(payment.id);

  } catch (error: any) {
    console.error('\n💥 Error occurred:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

export { createOrangePayment, pollPaymentStatus, handlePaymentResult, manualStatusCheck };
