/**
 * Generate a unique affiliate code in the format: ABDU-XXXXXX
 * Where X is an alphanumeric character
 */

export function generateAffiliateCode(): string {
  const prefix = 'ABDU';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';

  // Generate 6 random alphanumeric characters
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefix}-${suffix}`;
}

/**
 * Validate affiliate code format
 */
export function validateAffiliateCodeFormat(code: string): boolean {
  const pattern = /^ABDU-[A-Z0-9]{6}$/;
  return pattern.test(code);
}
