/**
 * CARTPLUS Payment Provider Architecture
 * Supports Cash on Delivery (production-ready) and provides clean integration
 * contracts for eSewa, Khalti, and Bank Transfer.
 */

export interface PaymentInitiationParams {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}

export interface PaymentInitiationResult {
  success: boolean;
  provider: 'Cash on Delivery' | 'eSewa' | 'Khalti' | 'Bank Transfer';
  redirectUrl?: string;
  paymentToken?: string;
  instructions?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  transactionId?: string;
  amount?: number;
  status: 'pending' | 'paid' | 'failed' | 'cod_pending';
  error?: string;
}

export interface PaymentProvider {
  name: string;
  isConfigured: boolean;
  initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult>;
  verifyPayment(referenceId: string): Promise<PaymentVerificationResult>;
}

export class CashOnDeliveryProvider implements PaymentProvider {
  name = 'Cash on Delivery';
  isConfigured = true;

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult> {
    return {
      success: true,
      provider: 'Cash on Delivery',
      instructions: `Cash on Delivery confirmed for order ${params.orderNumber}. Please keep Rs. ${params.amount} ready in cash upon arrival.`,
    };
  }

  async verifyPayment(): Promise<PaymentVerificationResult> {
    return {
      verified: true,
      status: 'cod_pending',
    };
  }
}

export class EsewaPaymentProvider implements PaymentProvider {
  name = 'eSewa';
  isConfigured = false; // Set to true when VITE_ESEWA_MERCHANT_CODE is provided in production

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentInitiationResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        provider: 'eSewa',
        error: 'Official eSewa EPAY merchant integration credentials are not yet configured in production environment.',
      };
    }
    // Real eSewa EPAY v2 endpoint redirection contract
    return {
      success: true,
      provider: 'eSewa',
      redirectUrl: `https://epay.esewa.com.np/api/epay/main/v2/form?amt=${params.amount}&scd=MERCHANT`,
    };
  }

  async verifyPayment(): Promise<PaymentVerificationResult> {
    return {
      verified: false,
      status: 'pending',
      error: 'eSewa live verification requires server-side HMAC validation.',
    };
  }
}

export class KhaltiPaymentProvider implements PaymentProvider {
  name = 'Khalti';
  isConfigured = false; // Set to true when KHALTI_SECRET_KEY is provided

  async initiatePayment(): Promise<PaymentInitiationResult> {
    return {
      success: false,
      provider: 'Khalti',
      error: 'Khalti live payment gateway requires secret key configuration.',
    };
  }

  async verifyPayment(): Promise<PaymentVerificationResult> {
    return {
      verified: false,
      status: 'pending',
    };
  }
}

export const codProvider = new CashOnDeliveryProvider();
export const esewaProvider = new EsewaPaymentProvider();
export const khaltiProvider = new KhaltiPaymentProvider();
