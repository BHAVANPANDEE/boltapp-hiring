/**
 * Validates whether an email address is syntactically complete and valid.
 * Requires: local-part @ domain . tld (min 2 chars)
 * Examples:
 *   abc          -> false
 *   abc@         -> false
 *   abc@gmail    -> false
 *   user@ex.com  -> true
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates phone numbers (supports various domestic and international formats)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s()-]/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15 && /^\+?\d+$/.test(cleaned);
}

/**
 * Validates a 6-digit numeric login code
 */
export function isValidOtp(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}
