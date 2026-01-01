const XPay = require('@x-pay/javascript-sdk');

async function webhooksExample() {
  const xpay = new XPay({
    apiKey: 'sk_test_your_api_key_here',
    environment: 'sandbox'
  });

  try {
    // Create a webhook endpoint
    console.log('Creating webhook endpoint...');
    const webhook = await xpay.webhooks.create({
      url: 'https://your-app.com/webhooks/xpay',
      events: [
        'payment.completed',
        'payment.failed',
        'payment.refunded'
      ],
      description: 'Main webhook endpoint for payment events'
    });

    console.log('Webhook created:', webhook.data);
    const webhookId = webhook.data.id;
    const webhookSecret = webhook.data.secret;

    // List all webhooks
    console.log('\nListing all webhooks...');
    const webhooksList = await xpay.webhooks.list();
    console.log('Webhooks:', webhooksList.data);

    // Retrieve specific webhook
    console.log('\nRetrieving webhook...');
    const retrievedWebhook = await xpay.webhooks.retrieve(webhookId);
    console.log('Retrieved webhook:', retrievedWebhook.data);

    // Update webhook
    console.log('\nUpdating webhook...');
    const updatedWebhook = await xpay.webhooks.update(webhookId, {
      events: [
        'payment.completed',
        'payment.failed',
        'payment.refunded',
        'payment.cancelled'
      ],
      description: 'Updated webhook with cancellation events'
    });
    console.log('Updated webhook:', updatedWebhook.data);

    // Test webhook
    console.log('\nTesting webhook...');
    const testResult = await xpay.webhooks.test(webhookId);
    console.log('Test result:', testResult.data);

    // Example of webhook signature verification
    console.log('\n--- Webhook Signature Verification Example ---');
    
    // This is what you would receive in your webhook endpoint
    const webhookPayload = JSON.stringify({
      event: 'payment.completed',
      data: {
        id: 'pay_123456',
        status: 'completed',
        amount: 1000,
        currency: 'USD'
      },
      timestamp: Date.now()
    });
    
    // This would come from the X-Pay-Signature header
    const receivedSignature = 'sha256=example_signature_hash';
    
    // Verify the signature (Note: this is a mock example)
    console.log('Webhook payload:', webhookPayload);
    console.log('Webhook secret:', webhookSecret);
    console.log('Received signature:', receivedSignature);
    
    // In a real application, you would verify like this:
    // const isValid = XPay.WebhooksAPI.verifySignature(
    //   webhookPayload,
    //   receivedSignature,
    //   webhookSecret
    // );
    // console.log('Signature valid:', isValid);

    // Cleanup - delete the test webhook
    console.log('\nDeleting test webhook...');
    const deleteResult = await xpay.webhooks.delete(webhookId);
    console.log('Delete result:', deleteResult.data);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

// Example webhook handler for Express.js
function createWebhookHandler() {
  return (req, res) => {
    const signature = req.headers['x-pay-signature'];
    const payload = JSON.stringify(req.body);
    
    // Verify signature
    const isValid = XPay.WebhooksAPI.verifySignature(
      payload,
      signature,
      process.env.XPAY_WEBHOOK_SECRET
    );
    
    if (!isValid) {
      return res.status(400).send('Invalid signature');
    }
    
    // Process the webhook
    const { event, data } = req.body;
    
    switch (event) {
      case 'payment.completed':
        console.log('Payment completed:', data);
        // Handle completed payment
        break;
        
      case 'payment.failed':
        console.log('Payment failed:', data);
        // Handle failed payment
        break;
        
      case 'payment.refunded':
        console.log('Payment refunded:', data);
        // Handle refunded payment
        break;
        
      default:
        console.log('Unhandled event:', event);
    }
    
    res.status(200).send('OK');
  };
}

webhooksExample();

module.exports = { createWebhookHandler };
