// Test X-Pay JavaScript SDK with deployed server (server.xpay-bits.com)
import XPay from './dist/index.esm.js';

async function testDeployedServer() {
  console.log('='.repeat(60));
  console.log('X-Pay JavaScript SDK - Deployed Server Test');
  console.log('Server: https://server.xpay-bits.com');
  console.log('='.repeat(60));
  console.log('');

  // Initialize SDK with deployed server
  const xpay = new XPay({
    apiKey: process.env.XPAY_API_KEY || 'sk_sandbox_your_api_key_here',
    merchantId: process.env.XPAY_MERCHANT_ID || 'your_merchant_id_here',
    environment: 'sandbox',
    baseUrl: 'https://server.xpay-bits.com'
  });

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, status, details) {
    const icon = status === 'PASS' ? '✓' : '✗';
    const color = status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${icon}\x1b[0m ${name}`);
    if (details) {
      console.log(`   ${details}`);
    }
    console.log('');

    results.tests.push({ name, status, details });
    if (status === 'PASS') results.passed++;
    else results.failed++;
  }

  // Test 1: Health Check
  try {
    console.log('Test 1: Health Check');
    console.log('-'.repeat(60));
    const pingResult = await xpay.ping();
    logTest(
      'Health Check',
      'PASS',
      `Server responded at ${pingResult.timestamp}`
    );
  } catch (error) {
    logTest(
      'Health Check',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Test 2: Get Payment Methods
  try {
    console.log('Test 2: Get Payment Methods');
    console.log('-'.repeat(60));
    const methods = await xpay.getPaymentMethods();
    logTest(
      'Get Payment Methods',
      'PASS',
      `Found ${methods.payment_methods?.length || 0} payment methods`
    );
    if (methods.payment_methods) {
      console.log('   Available methods:');
      methods.payment_methods.forEach(method => {
        console.log(`     - ${method.name} (${method.type}): ${method.description}`);
      });
      console.log('');
    }
  } catch (error) {
    logTest(
      'Get Payment Methods',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Test 3: Create Stripe Payment
  try {
    console.log('Test 3: Create Stripe Payment');
    console.log('-'.repeat(60));
    const payment = await xpay.payments.create({
      amount: '10.00',
      currency: 'USD',
      payment_method: 'stripe',
      description: 'Test payment from JS SDK - Deployed Server',
      payment_method_data: {
        payment_method_types: ['card']
      },
      metadata: {
        test: 'deployed_server',
        sdk: 'javascript',
        timestamp: new Date().toISOString()
      }
    });

    logTest(
      'Create Stripe Payment',
      'PASS',
      `Payment ID: ${payment.data.id}, Status: ${payment.data.status}`
    );

    if (payment.data.client_secret) {
      console.log(`   Client Secret: ${payment.data.client_secret.substring(0, 20)}...`);
      console.log('');
    }
  } catch (error) {
    logTest(
      'Create Stripe Payment',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Test 4: Create MoMo Payment
  try {
    console.log('Test 4: Create Mobile Money Payment');
    console.log('-'.repeat(60));
    const momoPayment = await xpay.payments.create({
      amount: '5.00',
      currency: 'GHS',
      payment_method: 'momo',
      description: 'Mobile Money test from JS SDK',
      payment_method_data: {
        phone_number: '+233123456789'
      }
    });

    logTest(
      'Create Mobile Money Payment',
      'PASS',
      `Payment ID: ${momoPayment.data.id}, Reference: ${momoPayment.data.reference_id || 'N/A'}`
    );
  } catch (error) {
    logTest(
      'Create Mobile Money Payment',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Test 5: List Payments
  try {
    console.log('Test 5: List Payments');
    console.log('-'.repeat(60));
    const paymentsList = await xpay.payments.list({ limit: 5 });
    const count = paymentsList.data?.payments?.length || paymentsList.data?.length || 0;

    logTest(
      'List Payments',
      'PASS',
      `Retrieved ${count} recent payments`
    );
  } catch (error) {
    logTest(
      'List Payments',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Test 6: Create Customer
  try {
    console.log('Test 6: Create Customer');
    console.log('-'.repeat(60));
    const customer = await xpay.customers.create({
      email: `test-${Date.now()}@example.com`,
      name: 'SDK Test User',
      phone: '+1234567890',
      description: 'Created by JavaScript SDK test',
      metadata: {
        source: 'deployed_server_test',
        timestamp: new Date().toISOString()
      }
    });

    logTest(
      'Create Customer',
      'PASS',
      `Customer ID: ${customer.data.id}, Email: ${customer.data.email}`
    );
  } catch (error) {
    logTest(
      'Create Customer',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Test 7: List Customers
  try {
    console.log('Test 7: List Customers');
    console.log('-'.repeat(60));
    const customersList = await xpay.customers.list({ limit: 5 });
    const count = customersList.data?.customers?.length || customersList.data?.length || 0;

    logTest(
      'List Customers',
      'PASS',
      `Retrieved ${count} customers`
    );
  } catch (error) {
    logTest(
      'List Customers',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Test 8: Create Webhook
  try {
    console.log('Test 8: Create Webhook');
    console.log('-'.repeat(60));
    const webhook = await xpay.webhooks.create({
      url: 'https://example.com/webhooks/xpay-test',
      events: ['payment.succeeded', 'payment.failed'],
      description: 'Test webhook from JavaScript SDK'
    });

    logTest(
      'Create Webhook',
      'PASS',
      `Webhook ID: ${webhook.data.id}, URL: ${webhook.data.url}`
    );
  } catch (error) {
    logTest(
      'Create Webhook',
      'FAIL',
      `${error.message} (Code: ${error.code})`
    );
  }

  // Print Summary
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`\x1b[32mPassed: ${results.passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${results.failed}\x1b[0m`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  console.log('');

  // Environment variable instructions
  if (!process.env.XPAY_API_KEY || !process.env.XPAY_MERCHANT_ID) {
    console.log('\x1b[33m⚠️  WARNING: Using placeholder credentials\x1b[0m');
    console.log('');
    console.log('To test with real credentials, set environment variables:');
    console.log('');
    console.log('  export XPAY_API_KEY="sk_sandbox_your_actual_api_key"');
    console.log('  export XPAY_MERCHANT_ID="your_actual_merchant_id"');
    console.log('  node test-deployed-server.js');
    console.log('');
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\x1b[31mUnhandled error:\x1b[0m', error);
  process.exit(1);
});

// Run tests
testDeployedServer();
