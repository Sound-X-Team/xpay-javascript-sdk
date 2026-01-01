import XPay from '../dist/index.esm.js';

const xpayLive = new XPay({ apiKey: 'xpay_live_test_123', environment: 'live' });
const xpaySandbox = new XPay({ apiKey: 'xpay_sandbox_test_123', environment: 'sandbox' });

// Access private client by property name; this is only for local inspection
const liveClient = xpayLive.client || xpayLive['client'];
const sandboxClient = xpaySandbox.client || xpaySandbox['client'];

const liveBase = typeof liveClient?.getBaseUrl === 'function' ? liveClient.getBaseUrl() : 'n/a';
const sandboxBase = typeof sandboxClient?.getBaseUrl === 'function' ? sandboxClient.getBaseUrl() : 'n/a';

console.log('Live base URL:', liveBase);
console.log('Sandbox base URL:', sandboxBase);
