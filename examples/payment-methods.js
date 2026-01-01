const XPay = require('@x-pay/javascript-sdk');

async function paymentMethodsExample() {
  const xpay = new XPay({
    apiKey: 'sk_test_your_api_key_here',
    environment: 'sandbox'
  });

  try {
    // Get all available payment methods
    console.log('Getting available payment methods...');
    const allMethods = await xpay.payments.getPaymentMethods();
    console.log('All payment methods:', JSON.stringify(allMethods.data, null, 2));

    // Get payment methods for a specific country
    console.log('\nGetting payment methods for Ghana...');
    const ghMethods = await xpay.payments.getPaymentMethods('GH');
    console.log('Ghana payment methods:', JSON.stringify(ghMethods.data, null, 2));

    // Show supported currencies for each payment method
    console.log('\n--- Payment Method Currency Support ---');
    ['stripe', 'momo', 'xpay_wallet'].forEach(method => {
      const currencies = xpay.payments.getSupportedCurrencies(method);
      console.log(`${method}: ${currencies.join(', ')}`);
    });

    // Create payments with different methods
    
    // 1. Stripe Credit Card Payment (USD auto-assigned)
    console.log('\n--- Creating Stripe Payment (USD default) ---');
    const stripePayment = await xpay.payments.create({
      amount: 2500, // $25.00 in cents
      payment_method: 'stripe', // Currency will default to USD
      description: 'Stripe card payment',
      payment_method_data: {
        payment_method_types: ['card']
      }
    });
    console.log('Stripe payment:', stripePayment.data);

    // 2. Mobile Money Payment (GHS auto-assigned)
    console.log('\n--- Creating Mobile Money Payment (GHS default) ---');
    const momoPayment = await xpay.payments.create({
      amount: 5000, // 50.00 GHS in pesewas
      payment_method: 'momo', // Currency will default to GHS
      description: 'Mobile money payment',
      payment_method_data: {
        phone_number: '+233123456789' // Replace with valid phone number
      }
    });
    console.log('Mobile Money payment:', momoPayment.data);

    // 3. X-Pay Wallet Payment with explicit EUR
    console.log('\n--- Creating X-Pay Wallet Payment (EUR explicit) ---');
    const walletPayment = await xpay.payments.create({
      amount: 1500, // €15.00 in cents
      currency: 'EUR', // Explicitly set to EUR
      payment_method: 'xpay_wallet',
      description: 'Wallet payment in EUR',
      customer_id: 'cust_example123', // Replace with actual customer ID
      payment_method_data: {
        wallet_id: 'wallet_example123', // Replace with actual wallet ID
        pin: '1234' // In production, handle PINs securely
      }
    });
    console.log('Wallet payment:', walletPayment.data);

    // 4. Show currency conversion utilities
    console.log('\n--- Currency Conversion Examples ---');
    
    // USD examples
    console.log('USD: $25.50 =', XPay.PaymentsAPI.toSmallestUnit(25.50, 'USD'), 'cents');
    console.log('USD: 2550 cents =', '$' + XPay.PaymentsAPI.fromSmallestUnit(2550, 'USD'));
    console.log('USD formatted:', XPay.PaymentsAPI.formatAmount(2550, 'USD'));
    
    // GHS examples  
    console.log('GHS: ₵100.25 =', XPay.PaymentsAPI.toSmallestUnit(100.25, 'GHS'), 'pesewas');
    console.log('GHS: 10025 pesewas =', '₵' + XPay.PaymentsAPI.fromSmallestUnit(10025, 'GHS'));
    console.log('GHS formatted:', XPay.PaymentsAPI.formatAmount(10025, 'GHS'));

    // Try invalid currency combination (should fail)
    console.log('\n--- Testing Invalid Currency ---');
    try {
      await xpay.payments.create({
        amount: 1000,
        currency: 'USD', // USD not supported for MoMo
        payment_method: 'momo',
        description: 'This should fail'
      });
    } catch (error) {
      console.log('Expected error:', error.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

paymentMethodsExample();
