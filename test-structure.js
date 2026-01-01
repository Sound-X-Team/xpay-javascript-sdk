// Test SDK without backend - just structure testing
const XPay = require('./dist/index.cjs.js').default || require('./dist/index.cjs.js');

console.log('🧪 Testing SDK Structure (No Backend Required)\n');

try {
  // Test 1: SDK can be imported and initialized
  console.log('1️⃣ Testing SDK Import & Initialization...');
  const xpay = new XPay({
    apiKey: 'xpay_sandbox_test_dummy_key',
    merchantId: 'test_merchant_dummy',
    environment: 'sandbox',
  baseUrl: 'https://server.xpay-bits.com'
  });
  console.log('✅ SDK initialized successfully');

  // Test 2: Check all APIs are available
  console.log('\n2️⃣ Testing API Surface...');
  console.log('✅ Payments API available:', typeof xpay.payments === 'object');
  console.log('✅ Customers API available:', typeof xpay.customers === 'object');
  console.log('✅ Webhooks API available:', typeof xpay.webhooks === 'object');
  
  // Test 3: Check payment methods
  console.log('\n3️⃣ Testing Static Methods...');
  const stripeCurrencies = xpay.payments.getSupportedCurrencies('stripe');
  console.log('✅ Stripe currencies:', stripeCurrencies);
  
  const momoCurrencies = xpay.payments.getSupportedCurrencies('momo');
  console.log('✅ MoMo currencies:', momoCurrencies);
  
  // Test 4: Check currency utilities
  console.log('\n4️⃣ Testing Currency Utilities...');
  const { PaymentsAPI } = require('./dist/index.cjs.js');
  
  try {
    const cents = PaymentsAPI.toSmallestUnit(25.99, 'USD');
    const formatted = PaymentsAPI.formatAmount(cents, 'USD');
    console.log(`✅ Currency conversion: $25.99 → ${cents} cents → ${formatted}`);
  } catch (error) {
    console.log('⚠️  Currency utilities test failed:', error.message);
  }
  
  console.log('\n🎉 SDK Structure Test Complete!');
  console.log('\n📋 What you need for live testing:');
  console.log('1. 🔑 API Key: Get from developer dashboard after registration');
  console.log('2. 🏪 Merchant ID: Auto-created during developer verification'); 
  console.log('3. 🖥️ Backend: Start with "go run main.go" on port 8000');
  console.log('4. 🌐 Dashboard: Access developer portal to get credentials');
  
  console.log('\n🔧 Credential Format:');
  console.log('- API Key: "xpay_sandbox_pk_..." or "xpay_sandbox_sk_..."');
  console.log('- Merchant ID: "merchant_uuid_format"');
  console.log('- Environment: "sandbox" (for testing)');
  console.log('- Base URL: "http://localhost:8000" (for local backend)');

} catch (error) {
  console.error('❌ SDK structure test failed:', error.message);
}