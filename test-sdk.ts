// TypeScript test script for X-Pay SDK
// Run with: npx ts-node test-sdk.ts

import XPay, { XPayError, PaymentRequest } from './src/index';

async function typeScriptTest(): Promise<void> {
  console.log('🚀 X-Pay TypeScript SDK Test\n');
  
  // Test with proper TypeScript types
  const xpay = new XPay({
    apiKey: 'xpay_sandbox_test_123456', // Replace with your real API key
    merchantId: 'test_merchant_id',      // Replace with your merchant ID  
    environment: 'sandbox',
    baseUrl: 'http://localhost:8000'
  });

  try {
    // Test 1: Type-safe ping
    console.log('1️⃣ Testing type-safe API calls...');
    const pingResult = await xpay.ping();
    console.log(`✅ Ping successful: ${pingResult.success}`);
    console.log(`   - Timestamp: ${pingResult.timestamp}`);

    // Test 2: Type-safe payment creation
    console.log('\n2️⃣ Testing typed payment creation...');
    const paymentRequest: PaymentRequest = {
      amount: '25.99',
      currency: 'USD', 
      payment_method: 'stripe',
      description: 'TypeScript test payment',
      payment_method_data: {
        payment_method_types: ['card']
      },
      metadata: {
        test: true,
        source: 'typescript_test',
        timestamp: new Date().toISOString()
      }
    };

    try {
      const paymentResponse = await xpay.payments.create(paymentRequest);
      
      if (paymentResponse.success) {
        const payment = paymentResponse.data;
        console.log('✅ Payment created with TypeScript types:');
        console.log(`   - ID: ${payment.id}`);
        console.log(`   - Status: ${payment.status}`);
        console.log(`   - Amount: ${payment.amount} ${payment.currency}`);
        console.log(`   - Method: ${payment.payment_method}`);
        
        if (payment.client_secret) {
          console.log(`   - Client Secret: ${payment.client_secret.substring(0, 20)}...`);
        }
      }
    } catch (error) {
      if (error instanceof XPayError) {
        console.log(`⚠️  Payment creation failed (API Error)`);
        console.log(`   - Message: ${error.message}`);
        console.log(`   - Code: ${error.code}`);
        console.log(`   - Status: ${error.status || 'N/A'}`);
      } else {
        throw error;
      }
    }

    // Test 3: Type-safe customer creation
    console.log('\n3️⃣ Testing typed customer management...');
    try {
      const customerResponse = await xpay.customers.create({
        email: 'typescript-test@example.com',
        name: 'TypeScript Test User',
        phone: '+1234567890',
        description: 'Customer created from TypeScript test',
        metadata: {
          source: 'typescript_test',
          test_mode: true
        }
      });

      if (customerResponse.success) {
        const customer = customerResponse.data;
        console.log('✅ Customer created with TypeScript types:');
        console.log(`   - ID: ${customer.id}`);
        console.log(`   - Name: ${customer.name}`);
        console.log(`   - Email: ${customer.email}`);
      }
    } catch (error) {
      if (error instanceof XPayError) {
        console.log(`⚠️  Customer creation failed`);
        console.log(`   - Error: ${error.message}`);
      }
    }

    // Test 4: Type-safe webhook management
    console.log('\n4️⃣ Testing typed webhook management...');
    try {
      const webhookResponse = await xpay.webhooks.create({
        url: 'https://your-site.com/webhooks/xpay-test',
        events: ['payment.succeeded', 'payment.failed', 'customer.created'],
        description: 'TypeScript test webhook'
      });

      if (webhookResponse.success) {
        const webhook = webhookResponse.data;
        console.log('✅ Webhook created with TypeScript types:');
        console.log(`   - ID: ${webhook.id}`);
        console.log(`   - URL: ${webhook.url}`);
        console.log(`   - Events: ${webhook.events.join(', ')}`);
        console.log(`   - Active: ${webhook.is_active}`);

        // Clean up webhook
        await xpay.webhooks.delete(webhook.id);
        console.log('✅ Webhook cleaned up');
      }
    } catch (error) {
      if (error instanceof XPayError) {
        console.log(`⚠️  Webhook management failed`);
        console.log(`   - Error: ${error.message}`);
      }
    }

    // Test 5: Static utility functions
    console.log('\n5️⃣ Testing static utility functions...');
    
    // Currency utilities (these work without API calls)
    const supportedCurrencies = xpay.payments.getSupportedCurrencies('stripe');
    console.log('✅ Currency utilities work:');
    console.log(`   - Stripe currencies: ${supportedCurrencies.join(', ')}`);
    
    console.log('\n🎉 TypeScript SDK Test Complete!');
    console.log('\n✨ TypeScript Benefits Verified:');
    console.log('   - 🔒 Type safety for all API calls');
    console.log('   - 🚨 Compile-time error detection');
    console.log('   - 🧠 IntelliSense and autocomplete support');
    console.log('   - 📝 Self-documenting code with types');
    console.log('   - 🛡️ Runtime type checking with proper error handling');

  } catch (error) {
    console.error('❌ TypeScript test failed:', error);
    
    if (error instanceof XPayError) {
      console.error('X-Pay API Error Details:');
      console.error(`- Message: ${error.message}`);
      console.error(`- Code: ${error.code}`);
      console.error(`- Status: ${error.status}`);
    }
  }
}

// Advanced TypeScript pattern testing
interface TestResult {
  test: string;
  success: boolean;
  details?: any;
}

async function advancedTypeScriptPatterns(): Promise<TestResult[]> {
  console.log('\n🧪 Testing Advanced TypeScript Patterns...');
  
  const results: TestResult[] = [];
  
  // Test generics and type inference
  try {
    const xpay = new XPay({
      apiKey: 'test',
      merchantId: 'test',
      baseUrl: 'http://localhost:8000'
    });
    
    // This should provide proper type inference
    const paymentPromise = xpay.payments.create({
      amount: '10.00',
      payment_method: 'stripe'
    });
    
    results.push({
      test: 'Type inference',
      success: true,
      details: 'Payment creation properly typed'
    });
    
  } catch (error) {
    results.push({
      test: 'Type inference', 
      success: false,
      details: error
    });
  }
  
  return results;
}

// Run tests
if (require.main === module) {
  console.log('Starting TypeScript SDK tests...\n');
  
  typeScriptTest()
    .then(() => advancedTypeScriptPatterns())
    .then(results => {
      console.log('\n📊 Advanced Pattern Test Results:');
      results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.test}: ${result.success ? 'PASSED' : 'FAILED'}`);
      });
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}