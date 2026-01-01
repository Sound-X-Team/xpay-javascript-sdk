// TypeScript test app using the local SDK
import XPay, { PaymentRequest, XPayError } from '@xpay/javascript-sdk';

async function testTypeScriptApp(): Promise<void> {
  console.log('🧪 Testing X-Pay TypeScript SDK from test app\n');
  
  const xpay = new XPay({
    apiKey: 'xpay_sandbox_test_your_key_here',
    merchantId: 'your_merchant_id_here', 
    environment: 'sandbox',
    baseUrl: 'http://localhost:8000'
  });

  try {
    // Test with full TypeScript support
    const ping = await xpay.ping();
    console.log('✅ TypeScript SDK working:', ping);

    // Type-safe payment request
    const paymentRequest: PaymentRequest = {
      amount: '29.99',
      currency: 'USD',
      payment_method: 'stripe',
      description: 'TypeScript test payment',
      metadata: {
        app: 'test-app',
        typescript: true
      }
    };

    const payment = await xpay.payments.create(paymentRequest);
    console.log('✅ Typed payment created:', payment.data);
    
  } catch (error) {
    if (error instanceof XPayError) {
      console.log('⚠️  Expected XPay error:', error.message, error.code);
    } else {
      console.log('⚠️  Other error:', (error as Error).message);
    }
  }
}

testTypeScriptApp();