// Basic payment example with X-Pay JavaScript SDK
const XPay = require('../dist/index.cjs.js').default || require('../dist/index.cjs.js');

async function basicPaymentExample() {
  // Initialize SDK
  const xpay = new XPay({
    apiKey: 'sk_sandbox_7c845adf-f658-4f29-9857-7e8a8708', // Fresh secret key for backend operations
    merchantId: '548d8033-fbe9-411b-991f-f159cdee7745', // Your actual merchant ID
    environment: 'sandbox',
    // No need to set baseUrl; SDK defaults to https://server.xpay-bits.com
  });

  try {
    // Test connection
    console.log('Testing connection to local backend...');
    const pingResult = await xpay.ping();
    console.log('Ping successful:', pingResult);

    // Get available payment methods
    console.log('\nGetting available payment methods...');
    const paymentMethods = await xpay.getPaymentMethods();
    console.log('Available payment methods:', paymentMethods);

    // Create a payment - amount as string to match backend API
    console.log('\nCreating Stripe payment with real credentials...');
    const stripePayment = await xpay.payments.create({
      amount: '15.99', // Amount as string
      currency: 'USD',
      payment_method: 'stripe',
      description: 'Real test payment from JavaScript SDK',
      payment_method_data: {
        payment_method_types: ['card']
      },
      metadata: {
        order_id: 'order_real_123',
        customer_email: 'test@example.com',
        test_run: 'real_credentials'
      }
    });

    console.log('Stripe payment created:', stripePayment.data);

    // Create a Mobile Money payment
    console.log('\nCreating Mobile Money payment...');
    const momoPayment = await xpay.payments.create({
      amount: '10.00',
      currency: 'LRD',
      payment_method: 'momo',
      description: 'Mobile Money test payment',
      payment_method_data: {
        phone_number: '+231881158457'
      }
    });

    console.log('MoMo payment created:', momoPayment.data);

    // Retrieve the payment
    console.log('\nRetrieving payment...');
    const retrievedPayment = await xpay.payments.retrieve(stripePayment.data.id);
    console.log('Payment retrieved:', retrievedPayment.data);

    // List recent payments
    console.log('\nListing recent payments...');
    const paymentsList = await xpay.payments.list({ limit: 5 });
    console.log('Recent payments:', paymentsList.data);

    // Create a customer
    console.log('\nCreating a customer...');
    const customer = await xpay.customers.create({
      email: 'test@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      description: 'Test customer from JavaScript SDK'
    });
    console.log('Customer created:', customer.data);

    // Create a webhook
    console.log('\nCreating a webhook...');
    const webhook = await xpay.webhooks.create({
      url: 'https://your-site.com/webhooks/xpay',
      events: ['payment.succeeded', 'payment.failed'],
      description: 'Test webhook from JavaScript SDK'
    });
    console.log('Webhook created:', webhook.data);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  }
}

// Run the example
console.log('X-Pay JavaScript SDK Example');
console.log('SDK will call https://server.xpay-bits.com by default.');
console.log('Use sandbox keys or live keys (set environment: "sandbox" or "live") and update apiKey/merchantId accordingly.\n');

basicPaymentExample();
