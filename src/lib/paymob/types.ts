export interface PaymobConfig {
  apiKey?: string;
  secretKey?: string;
  publicKey?: string;
  integrationIdCard?: number;
  hmacSecret?: string;
  apiBaseUrl?: string;
}

export interface PaymobIntentionItem {
  name: string;
  amount: number; // in cents
  description?: string;
  quantity: number;
}

export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  apartment?: string;
  floor?: string;
  street?: string;
  building?: string;
  shipping_method?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  state?: string;
}

export interface CreateIntentionParams {
  amount: number; // in whole EGP, will be converted to cents
  currency?: string; // defaults to "EGP"
  orderNumber: string;
  items: Array<{ name: string; unitPrice: number; quantity: number }>;
  billingData: {
    fullName: string;
    phone: string;
    email?: string;
    city?: string;
    governorate?: string;
    address?: string;
  };
  notificationUrl?: string;
  redirectionUrl?: string;
}

export interface PaymobIntentionResponse {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  payment_keys?: Array<{ key: string }>;
  special_reference?: string;
}

export interface PaymobTransactionObject {
  id: number;
  amount_cents: number;
  success: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  is_refunded: boolean;
  is_3d_secure: boolean;
  integration_id: number;
  currency: string;
  pending: boolean;
  created_at: string;
  error_occured: boolean;
  has_parent_transaction: boolean;
  owner: number;
  order: {
    id: number;
    merchant_order_id?: string;
  };
  source_data?: {
    pan?: string;
    sub_type?: string;
    type?: string;
  };
  special_reference?: string;
  merchant_order_id?: string;
}

export interface PaymobWebhookPayload {
  type: string;
  obj: PaymobTransactionObject;
}

export type PaymobPaymentStatus = "PAID" | "PENDING" | "FAILED" | "CANCELLED";

