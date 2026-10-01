import { supabase } from '../lib/supabase';
import {
  validateGenuineEmail,
  validateGenuinePhone,
  validateNepalPanVat,
  validateNepalBankAccount,
  containsGibberishOrTest,
} from '../utils/genuineValidation';

export type VerificationStage =
  | 'FORMAT_VALID'
  | 'DUPLICATE_CHECK'
  | 'MANUAL_REVIEW'
  | 'OFFICIAL_VERIFICATION';

export interface SellerVerificationResult {
  isValidFormat: boolean;
  isUnique: boolean;
  stage: VerificationStage;
  status: 'pending' | 'manual_review_required' | 'rejected' | 'verified';
  errors: Record<string, string>;
  notes: string;
}

/**
 * Validates format of seller details.
 * Explicitly distinguishes format checks from identity/official verification.
 */
export function validateSellerInformation(data: {
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  panVatNumber: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.storeName.trim() || data.storeName.trim().length < 3) {
    errors.storeName = 'Store name must be at least 3 characters.';
  } else if (containsGibberishOrTest(data.storeName)) {
    errors.storeName = 'Please enter a genuine business store name.';
  }

  if (!data.ownerName.trim() || data.ownerName.trim().length < 3) {
    errors.ownerName = 'Owner full name is required.';
  } else if (containsGibberishOrTest(data.ownerName)) {
    errors.ownerName = 'Please enter a genuine owner name.';
  }

  const emailCheck = validateGenuineEmail(data.email);
  if (!emailCheck.isValid) {
    errors.email = emailCheck.error || 'Invalid business email.';
  }

  const phoneCheck = validateGenuinePhone(data.phone);
  if (!phoneCheck.isValid) {
    errors.phone = phoneCheck.error || 'Invalid Nepal mobile number.';
  }

  const panCheck = validateNepalPanVat(data.panVatNumber);
  if (!panCheck.isValid) {
    errors.panVatNumber = panCheck.error || 'Invalid PAN/VAT number (must be 9 digits).';
  }

  const bankCheck = validateNepalBankAccount(data.bankName, data.accountNumber, data.accountHolder);
  if (!bankCheck.isValid) {
    Object.assign(errors, bankCheck.errors);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Real database duplicate check via Supabase
 */
export async function checkDuplicateSeller(params: {
  email: string;
  phone: string;
  panVatNumber: string;
  storeName: string;
  excludeUserId?: string;
}): Promise<{ isDuplicate: boolean; conflictField?: string; message?: string }> {
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id, user_id, email, phone, pan_vat_number, store_name')
      .or(`email.eq.${params.email.toLowerCase()},phone.eq.${params.phone},pan_vat_number.eq.${params.panVatNumber}`)
      .limit(1);

    if (error) {
      console.warn('Duplicate check query warning:', error.message);
      return { isDuplicate: false };
    }

    if (data && data.length > 0) {
      const match = data[0];
      if (params.excludeUserId && match.user_id === params.excludeUserId) {
        return { isDuplicate: false };
      }
      if (match.email.toLowerCase() === params.email.toLowerCase()) {
        return { isDuplicate: true, conflictField: 'email', message: 'A seller with this email is already registered.' };
      }
      if (match.phone === params.phone) {
        return { isDuplicate: true, conflictField: 'phone', message: 'A seller with this phone number is already registered.' };
      }
      if (match.pan_vat_number === params.panVatNumber) {
        return { isDuplicate: true, conflictField: 'pan_vat_number', message: 'This PAN/VAT number is already associated with another merchant.' };
      }
    }

    return { isDuplicate: false };
  } catch (err) {
    console.error('Error checking duplicate seller:', err);
    return { isDuplicate: false };
  }
}

/**
 * Validates PAN/VAT. Since no official government IRD API key is configured,
 * verifies format and routes to MANUAL_REVIEW. Never invents fake IRD responses.
 */
export function verifyPanVat(panVatNumber: string): {
  isValidFormat: boolean;
  status: 'format_valid' | 'manual_review_required' | 'invalid';
  message: string;
} {
  const check = validateNepalPanVat(panVatNumber);
  if (!check.isValid) {
    return {
      isValidFormat: false,
      status: 'invalid',
      message: check.error || 'Invalid PAN/VAT format',
    };
  }

  // Official Nepal Inland Revenue Department (IRD) API is not configured.
  // We do not fabricate a government response.
  return {
    isValidFormat: true,
    status: 'manual_review_required',
    message: 'PAN format valid (9 digits). Document verification required by CARTPLUS compliance staff.',
  };
}

/**
 * Validates phone format.
 */
export function verifyPhone(phone: string): { isValid: boolean; message?: string } {
  const check = validateGenuinePhone(phone);
  return {
    isValid: check.isValid,
    message: check.error,
  };
}

/**
 * Validates email format.
 */
export function verifyEmail(email: string): { isValid: boolean; message?: string } {
  const check = validateGenuineEmail(email);
  return {
    isValid: check.isValid,
    message: check.error,
  };
}
