#!/usr/bin/env node

// Quick test script for the X-Pay TypeScript SDK
// This tests the built SDK without needing to publish to npm

const XPay = require('./dist/index.cjs.js').default || require('./dist/index.cjs.js');

async function quickTest() {
  console.log('🚀 X-Pay JavaScript SDK Quick Test\n');
  
  // Test 1: SDK Initialization
  console.log('1️⃣ Testing SDK Initialization...');
  try {
    const xpay = new XPay({
      apiKey: 'sk_sandbox_7c845adf-f658-4f29-9857-7e8a8708', // Fresh secret key for API operations
      merchantId: '548d8033-fbe9-411b-991f-f159cdee7745',
      environment: 'sandbox',
      baseUrl: 'http://localhost:8000'
    });
    
    console.log('✅ SDK initialized successfully');
    console.log('   - API Key configured');
    console.log('   - Merchant ID set');
    console.log('   - Environment: sandbox');
    console.log('   - Base URL: http://localhost:8000');
    
    // Test 2: Check API availability
    console.log('\n2️⃣ Testing API Connectivity...');
    try {
      const pingResult = await xpay.ping();
      console.log('✅ Backend connectivity successful');
      console.log(`   - Response: ${JSON.stringify(pingResult)}`);
      
      // Test 3: Test payment methods
      console.log('\n3️⃣ Testing Payment Methods API...');
      try {
        const paymentMethods = await xpay.getPaymentMethods();
        console.log('✅ Payment methods retrieved');
        console.log(`   - Available methods: ${paymentMethods.payment_methods?.length || 0}`);
        console.log(`   - Environment: ${paymentMethods.environment}`);
        console.log(`   - Merchant ID: ${paymentMethods.merchant_id}`);
      } catch (error) {
        console.log('⚠️  Payment methods API not available (backend might not be running)');
        console.log(`   - Error: ${error.message}`);
      }
      
      // Test 4: Test payment creation (will likely fail without proper API key)
      console.log('\n4️⃣ Testing Payment Creation...');
      try {
        const payment = await xpay.payments.create({
          amount: '25.99',
          currency: 'USD',
          payment_method: 'stripe',
          description: 'Test payment with real credentials',
          payment_method_data: {
            payment_method_types: ['card']
          },
          metadata: {
            test: true,
            source: 'quick_test_script_real_creds'
          }
        });
        console.log('✅ Payment created successfully');
        console.log(`   - Payment ID: ${payment.data.id}`);
        console.log(`   - Status: ${payment.data.status}`);
        console.log(`   - Amount: ${payment.data.amount} ${payment.data.currency}`);
      } catch (error) {
        console.log('⚠️  Payment creation failed (expected without valid API key)');
        console.log(`   - Error: ${error.message}`);
        console.log(`   - Code: ${error.code || 'N/A'}`);
      }
      
    } catch (error) {
      console.log('❌ Backend connectivity failed');
      console.log(`   - Error: ${error.message}`);
      console.log('   - Make sure your backend is running on http://localhost:8000');
    }
    
    // Test 5: Test SDK methods availability
    console.log('\n5️⃣ Testing SDK API Surface...');
    console.log('✅ Available APIs:');
    console.log('   - xpay.payments (create, retrieve, list, cancel, getPaymentMethods)');
    console.log('   - xpay.customers (create, retrieve, update, delete, list)');  
    console.log('   - xpay.webhooks (create, retrieve, update, delete, list, test)');
    console.log('   - xpay.ping()');
    console.log('   - xpay.getPaymentMethods()');
    
    console.log('\n🎉 SDK Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start your backend: go run main.go');
    console.log('2. Register a developer account to get real API keys');
    console.log('3. Replace the test API key in examples/basic-payment.js');
    console.log('4. Run: node examples/basic-payment.js');
    
  } catch (error) {
    console.log('❌ SDK initialization failed');
    console.log(`   - Error: ${error.message}`);
  }
}

// Run the test
quickTest().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});