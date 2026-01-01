export interface XPayConfig {
  apiKey: string;
  merchantId?: string;
  environment?: 'sandbox' | 'live';
  baseUrl?: string;
  timeout?: number;
}

export interface PaymentRequest {
  amount: string; // Amount as string to match backend (e.g., "10.00")
  currency?: string; // Optional - will be determined by payment method/account if not specified
  payment_method: 'stripe' | 'momo' | 'momo_liberia' | 'momo_nigeria' | 'momo_uganda' | 'momo_rwanda' | 'orange' | 'wallet' | 'xpay_wallet';
  description?: string;
  customer_id?: string;
  payment_method_data?: {
    // Stripe
    payment_method_types?: string[];

    // Mobile Money & Orange Money
    phone_number?: string;

    // X-Pay Wallet
    wallet_id?: string;
    pin?: string;
  };
  metadata?: Record<string, any>;
  success_url?: string;
  cancel_url?: string;
  webhook_url?: string;
}

export interface Payment {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'succeeded' | 'failed' | 'cancelled';
  amount: string;
  currency: string;
  description?: string;
  payment_method: string;
  customer_id?: string;
  client_secret?: string; // For Stripe
  reference_id?: string;  // For MoMo
  transaction_url?: string; // For redirects
  instructions?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethods {
  available_methods: Array<{
    type: string;
    display_name: string;
    currencies: string[];
    description: string;
  }>;
  country: string;
  default_currency: string;
  stripe_config?: {
    publishable_key: string; // X-Pay's Stripe publishable key for frontend integration
  };
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  environment: 'sandbox' | 'live';
  is_active: boolean;
  secret: string;
  created_at: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  description?: string;
}

export class XPayError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'XPayError';
  }
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Currency and payment method utilities
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  smallest_unit_name: string; // cents, pesewas, etc.
}

export interface PaymentMethodCurrency {
  payment_method: string;
  supported_currencies: string[];
  default_currency: string;
  regions: string[];
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimal_places: 2,
    smallest_unit_name: 'cents'
  },
  LRD: {
    code: 'LRD',
    name: 'Liberian Dollar',
    symbol: 'L$',
    decimal_places: 2,
    smallest_unit_name: 'cents'
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimal_places: 2,
    smallest_unit_name: 'cents'
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimal_places: 2,
    smallest_unit_name: 'pence'
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: '₵',
    decimal_places: 2,
    smallest_unit_name: 'pesewas'
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    decimal_places: 2,
    smallest_unit_name: 'kobo'
  },
  UGX: {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    decimal_places: 0,
    smallest_unit_name: 'shillings'
  },
  RWF: {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'FRw',
    decimal_places: 0,
    smallest_unit_name: 'francs'
  },
  XOF: {
    code: 'XOF',
    name: 'West African CFA Franc',
    symbol: 'CFA',
    decimal_places: 0,
    smallest_unit_name: 'francs'
  }
};

export const PAYMENT_METHOD_CURRENCIES: Record<string, PaymentMethodCurrency> = {
  stripe: {
    payment_method: 'stripe',
    supported_currencies: ['USD', 'EUR', 'GBP', 'GHS', 'NGN', 'UGX', 'RWF'],
    default_currency: 'USD',
    regions: ['US', 'EU', 'GB', 'GH', 'NG', 'UG', 'RW', 'LR']
  },
  momo: {
    payment_method: 'momo',
    supported_currencies: ['GHS', 'USD'],
    default_currency: 'GHS',
    regions: ['GH']
  },
  momo_liberia: {
    payment_method: 'momo_liberia',
    supported_currencies: ['USD', 'LRD'],
    default_currency: 'USD',
    regions: ['LR']
  },
  momo_nigeria: {
    payment_method: 'momo_nigeria',
    supported_currencies: ['NGN'],
    default_currency: 'NGN',
    regions: ['NG']
  },
  momo_uganda: {
    payment_method: 'momo_uganda',
    supported_currencies: ['UGX'],
    default_currency: 'UGX',
    regions: ['UG']
  },
  momo_rwanda: {
    payment_method: 'momo_rwanda',
    supported_currencies: ['RWF'],
    default_currency: 'RWF',
    regions: ['RW']
  },
  orange: {
    payment_method: 'orange',
    supported_currencies: ['USD', 'LRD', 'XOF'],
    default_currency: 'USD',
    regions: ['LR', 'CI', 'SN', 'ML']
  },
  xpay_wallet: {
    payment_method: 'xpay_wallet',
    supported_currencies: ['USD', 'LRD', 'NGN', 'UGX', 'RWF', 'GHS'],
    default_currency: 'USD',
    regions: ['GLOBAL']
  },
  wallet: {
    payment_method: 'wallet',
    supported_currencies: ['USD', 'LRD', 'NGN', 'UGX', 'RWF', 'GHS'],
    default_currency: 'USD',
    regions: ['GLOBAL']
  }
};
