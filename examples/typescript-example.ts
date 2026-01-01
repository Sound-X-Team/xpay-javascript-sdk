import XPay, { XPayError, PaymentRequest, Payment } from '../src/index';

async function typescriptExample(): Promise<void> {
  // Initialize with proper typing
  const xpay = new XPay({
    apiKey: 'xpay_sandbox_test_your_api_key_here', // Replace with your actual API key
    merchantId: 'your_merchant_id_here', // Replace with your actual merchant ID
    environment: 'sandbox',
    baseUrl: 'https://server.xpay-bits.com', // Point to hosted X-Pay API
    timeout: 30000
  });

  try {
    // Test API connectivity with type safety
    console.log('Testing API connectivity...');
    const pingResult = await xpay.ping();
    console.log(`Connection successful at ${pingResult.timestamp}`);

    // Get available payment methods with proper typing
    console.log('\nGetting available payment methods...');
    const paymentMethods = await xpay.getPaymentMethods();
    console.log('Available payment methods:', paymentMethods);

    // Create a strongly-typed payment request
    const paymentRequest: PaymentRequest = {
      amount: '25.00', // Amount as string to match backend API
      currency: 'USD',
      payment_method: 'stripe',
      description: 'TypeScript SDK test payment',
      payment_method_data: {
        payment_method_types: ['card']
      },
      metadata: {
        source: 'typescript-example',
        user_id: 'user_12345',
        order_number: 'ORD-2024-001'
      },
      success_url: 'https://your-site.com/success',
      cancel_url: 'https://your-site.com/cancel'
    };

    console.log('\nCreating payment...');
    const paymentResponse = await xpay.payments.create(paymentRequest);
    
    if (paymentResponse.success) {
      const payment: Payment = paymentResponse.data;
      console.log('Payment created successfully:');
      console.log(`- ID: ${payment.id}`);
      console.log(`- Status: ${payment.status}`);
      console.log(`- Amount: ${payment.amount} ${payment.currency}`);
      console.log(`- Description: ${payment.description}`);
      
      // Retrieve payment with type safety
      console.log('\nRetrieving payment...');
      const retrievedResponse = await xpay.payments.retrieve(payment.id);
      
      if (retrievedResponse.success) {
        const retrievedPayment = retrievedResponse.data;
        console.log(`Retrieved payment status: ${retrievedPayment.status}`);
      }

      // Create Mobile Money payment 
      console.log('\nCreating MoMo payment...');
      const momoRequest: PaymentRequest = {
        amount: '100.00',
        currency: 'GHS',
        payment_method: 'momo',
        description: 'TypeScript MoMo test',
        payment_method_data: {
          phone_number: '+233123456789'
        },
        metadata: {
          source: 'typescript-sdk',
          test: true
        }
      };

      const momoResponse = await xpay.payments.create(momoRequest);
      if (momoResponse.success) {
        console.log(`MoMo payment: ${momoResponse.data.amount} ${momoResponse.data.currency}`);
        if (momoResponse.data.reference_id) {
          console.log(`Reference ID: ${momoResponse.data.reference_id}`);
        }
      }

      // List payments with typed parameters
      console.log('\nListing recent payments...');
      const listResponse = await xpay.payments.list({
        limit: 10,
        offset: 0,
        status: 'pending'
      });

      if (listResponse.success) {
        console.log(`Found ${listResponse.data.total} payments`);
        listResponse.data.payments.forEach((p: Payment) => {
          console.log(`- ${p.id}: ${p.status} (${p.amount} ${p.currency})`);
        });
      }
    }

    // Customer management with type safety
    console.log('\nCreating customer...');
    const customerResponse = await xpay.customers.create({
      email: 'typescript@example.com',
      name: 'TypeScript User',
      phone: '+1234567890',
      description: 'Created from TypeScript SDK',
      metadata: {
        source: 'typescript-example',
        signup_date: new Date().toISOString()
      }
    });

    if (customerResponse.success) {
      const customer = customerResponse.data;
      console.log(`Customer created: ${customer.name} (${customer.email})`);
      
      // Update customer
      const updateResponse = await xpay.customers.update(customer.id, {
        description: 'Updated from TypeScript SDK'
      });
      
      if (updateResponse.success) {
        console.log('Customer updated successfully');
      }
    }

    // Webhook management with types
    console.log('\nCreating webhook...');
    const webhookResponse = await xpay.webhooks.create({
      url: 'https://your-app.com/webhooks/xpay',
      events: ['payment.succeeded', 'payment.failed', 'customer.created'],
      description: 'TypeScript webhook example'
    });

    if (webhookResponse.success) {
      const webhook = webhookResponse.data;
      console.log('Webhook created:');
      console.log(`- ID: ${webhook.id}`);
      console.log(`- URL: ${webhook.url}`);
      console.log(`- Events: ${webhook.events.join(', ')}`);
      console.log(`- Active: ${webhook.is_active}`);

      // List webhooks
      const webhooksListResponse = await xpay.webhooks.list();
      if (webhooksListResponse.success) {
        console.log(`Total webhooks: ${webhooksListResponse.data.webhooks.length}`);
      }

      // Clean up webhook
      await xpay.webhooks.delete(webhook.id);
      console.log('Webhook deleted');
    }

  } catch (error) {
    // Proper error handling with type checking
    if (error instanceof XPayError) {
      console.error('X-Pay API Error:');
      console.error(`- Message: ${error.message}`);
      console.error(`- Code: ${error.code}`);
      if (error.status) {
        console.error(`- HTTP Status: ${error.status}`);
      }
      if (error.details) {
        console.error(`- Details:`, error.details);
      }
    } else if (error instanceof Error) {
      console.error('General Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    
    process.exit(1);
  }
}

// Advanced TypeScript patterns for payment processing
interface PaymentHandler {
  handlePayment(payment: Payment): Promise<void>;
}

class StripePaymentHandler implements PaymentHandler {
  async handlePayment(payment: Payment): Promise<void> {
    if (payment.payment_method === 'stripe') {
      console.log(`Processing Stripe payment: ${payment.id}`);
      
      if (payment.client_secret) {
        console.log(`Client secret available for frontend confirmation`);
      }
    }
  }
}

class MoMoPaymentHandler implements PaymentHandler {
  async handlePayment(payment: Payment): Promise<void> {
    if (payment.payment_method.includes('momo')) {
      console.log(`Processing Mobile Money payment: ${payment.id}`);
      
      if (payment.reference_id) {
        console.log(`Reference ID: ${payment.reference_id}`);
      }
      
      if (payment.instructions) {
        console.log(`Instructions: ${payment.instructions}`);
      }
    }
  }
}

// Factory pattern for payment handlers
class PaymentHandlerFactory {
  private static handlers: Map<string, PaymentHandler> = new Map([
    ['stripe', new StripePaymentHandler()],
    ['momo', new MoMoPaymentHandler()],
    ['momo_ghana', new MoMoPaymentHandler()],
    ['momo_liberia', new MoMoPaymentHandler()],
    ['momo_nigeria', new MoMoPaymentHandler()],
  ]);

  static getHandler(paymentMethod: string): PaymentHandler | undefined {
    return this.handlers.get(paymentMethod);
  }
}

// Generic utility function with type safety
async function processPayments<T extends Payment>(
  xpay: XPay,
  paymentIds: string[]
): Promise<T[]> {
  const payments: T[] = [];
  
  for (const id of paymentIds) {
    try {
      const response = await xpay.payments.retrieve(id);
      if (response.success) {
        payments.push(response.data as T);
      }
    } catch (error) {
      console.warn(`Failed to retrieve payment ${id}:`, error);
    }
  }
  
  return payments;
}

// Run the example
if (require.main === module) {
  console.log('X-Pay TypeScript SDK Example');
  console.log('Make sure your backend is running on http://localhost:8000');
  console.log('Update the apiKey and merchantId with your actual values\n');
  
  typescriptExample().catch(console.error);
}

export { 
  typescriptExample, 
  PaymentHandler, 
  PaymentHandlerFactory, 
  processPayments 
};
