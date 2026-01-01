// JavaScript test app using the local SDK
const XPay = require('@xpay/javascript-sdk');

async function testApp() {
  console.log('🧪 Testing X-Pay SDK from test app\n');
  
  const xpay = new XPay({
    apiKey: 'xpay_sandbox_test_your_key_here',
    merchantId: 'your_merchant_id_here',
    environment: 'sandbox',
    baseUrl: 'https://server.xpay-bits.com'
  });

  try {
    // Test basic connectivity
    const ping = await xpay.ping();
    console.log('✅ SDK working from test app:', ping);

    // Try creating a payment
    const payment = await xpay.payments.create({
      amount: '19.99',
      currency: 'USD',
      payment_method: 'stripe',
      description: 'Test from separate app'
    });
    
    console.log('✅ Payment created:', payment.data);
    
  } catch (error) {
    console.log('⚠️  Expected error (need real API keys):', error.message);
  }
}

testApp();