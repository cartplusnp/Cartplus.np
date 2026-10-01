/**
 * Comprehensive Genuine Verification Engine for CARTPLUS
 * Validates real identity, genuine Nepal contact credentials, authentic shipping
 * addresses, and legitimate seller business details.
 */

// Suspicious / dummy keywords that bots or careless testers use
const BANNED_PATTERNS = [
  'test',
  'testing',
  'asdf',
  'qwerty',
  'dummy',
  'fake',
  'sample',
  'unknown',
  'null',
  'undefined',
  'temp',
  'none',
  'abcde',
  'xyz',
  'demo',
  'n/a',
  'na',
];

/**
 * Checks if a string contains obvious gibberish or test keywords
 */
export function containsGibberishOrTest(str: string): boolean {
  if (!str) return true;
  const clean = str.trim().toLowerCase();
  
  // Exact match or contains banned words
  for (const banned of BANNED_PATTERNS) {
    if (clean === banned || clean.split(/\s+/).includes(banned)) {
      return true;
    }
  }

  // 4 or more identical consecutive characters (e.g. "aaaa", "zzzz")
  if (/(.)\1{3,}/.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Validates genuine full name (requires at least first and last name, realistic characters)
 */
export function validateGenuineName(name: string, roleLabel: string = 'Full Name'): { isValid: boolean; error?: string } {
  const trimmed = (name || '').trim();

  if (!trimmed) {
    return { isValid: false, error: `${roleLabel} is required.` };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: `${roleLabel} must be at least 3 characters long.` };
  }

  if (trimmed.length > 70) {
    return { isValid: false, error: `${roleLabel} is unusually long.` };
  }

  // Check for numbers or illegal symbols
  if (/[0-9!@#$%^&*()_+=\[\]{};:"\\|<>?~`]/.test(trimmed)) {
    return { isValid: false, error: `${roleLabel} should only contain letters, spaces, or hyphens (no numbers or symbols).` };
  }

  // Check for test keywords
  if (containsGibberishOrTest(trimmed)) {
    return { isValid: false, error: `Please enter your genuine legal name (avoid dummy or test words like "test", "asdf").` };
  }

  // Require at least two words for genuine identity verification (First Name and Last Name)
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return {
      isValid: false,
      error: `Please provide both your First and Last name (e.g. "Ramesh Thapa" or "Sita Shrestha").`,
    };
  }

  // Check each part has reasonable length (e.g. not single letters like "a b")
  if (parts.some((p) => p.length < 2)) {
    return {
      isValid: false,
      error: `Each part of your name must have at least 2 characters.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates genuine email address with RFC syntax, domain check, and anti-spam detection
 */
export function validateGenuineEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = (email || '').trim().toLowerCase();

  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }

  // Standard email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  // Reject dummy/test domains and names
  const [localPart, domain] = trimmed.split('@');
  if (
    localPart === 'test' ||
    localPart === 'dummy' ||
    localPart === 'asdf' ||
    localPart === 'fake' ||
    localPart === 'admin' ||
    localPart.length < 2
  ) {
    return { isValid: false, error: 'Please provide a genuine personal or business email address.' };
  }

  if (
    domain.endsWith('.test') ||
    domain.endsWith('.example') ||
    domain.endsWith('.invalid') ||
    domain.endsWith('.localhost') ||
    domain === 'test.com' ||
    domain === 'fake.com' ||
    domain === 'dummy.com'
  ) {
    return { isValid: false, error: 'Email domain appears to be a placeholder or test domain.' };
  }

  return { isValid: true };
}

/**
 * Validates genuine Nepal mobile number (10 digits starting with 98, 97, or 96)
 * Detects fake numbers like repeated or sequential digits.
 */
export function validateGenuinePhone(phone: string): { isValid: boolean; error?: string } {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  // Strip spaces, dashes, parentheses, +977
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  const digits = cleaned.replace(/^977/, '');

  if (!/^(98|97|96)\d{8}$/.test(digits)) {
    return {
      isValid: false,
      error: 'Enter a genuine 10-digit Nepal mobile number starting with 98, 97, or 96 (e.g. 9841234567).',
    };
  }

  // Check for fake repeating numbers e.g. 9800000000, 9811111111, 9899999999
  const suffix = digits.slice(2);
  if (/^(\d)\1{7}$/.test(suffix)) {
    return {
      isValid: false,
      error: 'Please enter a real working mobile number (repeated digits detected).',
    };
  }

  // Check for simple sequences e.g. 12345678 or 87654321
  if (suffix === '12345678' || suffix === '01234567' || suffix === '87654321') {
    return {
      isValid: false,
      error: 'Please enter a genuine, active mobile phone number.',
    };
  }

  return { isValid: true };
}

/**
 * Validates genuine shipping address details for Nepal delivery
 */
export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  street: string;
  landmark?: string;
}

export function validateGenuineShippingAddress(details: ShippingAddressInput): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // 1. Recipient Full Name
  const nameCheck = validateGenuineName(details.fullName, 'Recipient Full Name');
  if (!nameCheck.isValid && nameCheck.error) {
    errors.fullName = nameCheck.error;
  }

  // 2. Contact Phone
  const phoneCheck = validateGenuinePhone(details.phone);
  if (!phoneCheck.isValid && phoneCheck.error) {
    errors.phone = phoneCheck.error;
  }

  // 3. Municipality / City
  const mun = (details.municipality || '').trim();
  if (!mun) {
    errors.municipality = 'Municipality / Metropolitan City is required.';
  } else if (mun.length < 3) {
    errors.municipality = 'Municipality name is too short.';
  } else if (containsGibberishOrTest(mun)) {
    errors.municipality = 'Please enter a genuine city or municipality name.';
  }

  // 4. Ward Number
  const wardStr = (details.ward || '').replace(/[^0-9]/g, '');
  const wardNum = parseInt(wardStr, 10);
  if (!wardStr || isNaN(wardNum) || wardNum < 1 || wardNum > 35) {
    errors.ward = 'Please enter a genuine municipal ward number (between Ward 1 and 35).';
  }

  // 5. Street / Tole / Area
  const street = (details.street || '').trim();
  if (!street) {
    errors.street = 'Street address, Chowk, or Tole name is required for delivery.';
  } else if (street.length < 5) {
    errors.street = 'Please provide a more descriptive street address or Tole (minimum 5 characters).';
  } else if (containsGibberishOrTest(street)) {
    errors.street = 'Please enter a genuine street name or delivery location.';
  }

  // Check for common fake single words in address like "home", "house", "none"
  const streetLower = street.toLowerCase();
  if (['home', 'house', 'room', 'street', 'nepal', 'ktm', 'kathmandu', 'office'].includes(streetLower)) {
    errors.street = 'Please provide your specific street address or nearest landmark (e.g. "Near Bhatbhateni, Naxal").';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates genuine PAN / VAT number for Nepal businesses
 * Nepal IRD PAN is strictly a 9-digit numeric identification.
 */
export function validateGenuinePanVat(pan: string): { isValid: boolean; error?: string } {
  const cleaned = (pan || '').replace(/[\s\-]/g, '');

  if (!cleaned) {
    return { isValid: false, error: '9-digit PAN / VAT Registration Number is required.' };
  }

  if (!/^\d{9}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'PAN / VAT must be exactly 9 numeric digits as issued by Nepal Inland Revenue Dept (IRD).',
    };
  }

  // Reject all identical digits e.g. 000000000, 111111111, 999999999
  if (/^(\d)\1{8}$/.test(cleaned)) {
    return { isValid: false, error: 'Please enter a genuine registered 9-digit PAN/VAT number.' };
  }

  // Reject trivial sequential digits
  if (cleaned === '123456789' || cleaned === '987654321') {
    return { isValid: false, error: 'Please enter your authentic IRD PAN registration number.' };
  }

  return { isValid: true };
}

/**
 * Validates genuine seller merchant onboarding credentials
 */
export interface SellerRegistrationInput {
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  panVatNumber: string;
  city: string;
  address: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  password?: string;
}

export function validateGenuineSellerRegistration(input: SellerRegistrationInput): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Store Name
  const store = (input.storeName || '').trim();
  if (!store) {
    errors.storeName = 'Store / Business Name is required.';
  } else if (store.length < 3) {
    errors.storeName = 'Store Name must be at least 3 characters.';
  } else if (containsGibberishOrTest(store)) {
    errors.storeName = 'Please enter a genuine store brand name (avoid test or dummy keywords).';
  }

  // Owner Name
  const ownerCheck = validateGenuineName(input.ownerName, 'Authorized Representative / Owner Name');
  if (!ownerCheck.isValid && ownerCheck.error) {
    errors.ownerName = ownerCheck.error;
  }

  // Email
  const emailCheck = validateGenuineEmail(input.email);
  if (!emailCheck.isValid && emailCheck.error) {
    errors.email = emailCheck.error;
  }

  // Phone
  const phoneCheck = validateGenuinePhone(input.phone);
  if (!phoneCheck.isValid && phoneCheck.error) {
    errors.phone = phoneCheck.error;
  }

  // PAN / VAT
  const panCheck = validateGenuinePanVat(input.panVatNumber);
  if (!panCheck.isValid && panCheck.error) {
    errors.panVatNumber = panCheck.error;
  }

  // City & Street Address
  if (!input.city || input.city.trim().length < 3 || containsGibberishOrTest(input.city)) {
    errors.city = 'Please enter a genuine city or municipality for your warehouse / store.';
  }

  if (!input.address || input.address.trim().length < 5 || containsGibberishOrTest(input.address)) {
    errors.address = 'Please provide a descriptive business street address or warehouse location.';
  }

  // Bank Account Payout Verification
  const accNum = (input.accountNumber || '').replace(/[\s\-]/g, '');
  if (!accNum) {
    errors.accountNumber = 'Bank Account Number is required for COD earnings payout.';
  } else if (accNum.length < 8 || accNum.length > 24) {
    errors.accountNumber = 'Bank Account Number must be between 8 and 24 characters.';
  } else if (/^(\d)\1{7,}$/.test(accNum) || accNum === '123456789') {
    errors.accountNumber = 'Please enter a genuine bank account number.';
  }

  const holderCheck = validateGenuineName(input.accountHolder, 'Bank Account Holder Name');
  if (!holderCheck.isValid && holderCheck.error) {
    errors.accountHolder = holderCheck.error;
  }

  // Password
  if (input.password !== undefined && input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const validateNepalPanVat = validateGenuinePanVat;

export function validateNepalBankAccount(
  bankName: string,
  accountNumber: string,
  accountHolder: string
): { isValid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!bankName || !bankName.trim()) {
    errors.bankName = 'Bank name is required.';
  }

  const accNum = (accountNumber || '').replace(/[\s\-]/g, '');
  if (!accNum) {
    errors.accountNumber = 'Bank account number is required.';
  } else if (accNum.length < 8 || accNum.length > 24) {
    errors.accountNumber = 'Bank account number must be between 8 and 24 characters.';
  } else if (/^(\d)\1{7,}$/.test(accNum) || accNum === '123456789') {
    errors.accountNumber = 'Please enter a genuine bank account number.';
  }

  const holderCheck = validateGenuineName(accountHolder, 'Account Holder Name');
  if (!holderCheck.isValid && holderCheck.error) {
    errors.accountHolder = holderCheck.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
