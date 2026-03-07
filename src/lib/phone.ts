/**
 * Azerbaijan phone number validation
 *
 * Rules (ported from official validation logic):
 * 1. Strip all non-digit characters
 * 2. Take the last 9 digits
 * 3. Length must be exactly 9
 * 4. First 2 digits must be a valid operator prefix
 * 5. 3rd digit cannot be 0 or 1
 */

const VALID_PREFIXES = ["10", "50", "51", "55", "60", "70", "77", "99"] as const;
const INVALID_THIRD_DIGITS = ["0", "1"] as const;

/** Strip non-digit characters */
export function cleanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Validate an Azerbaijan phone number.
 * Returns the canonical 9-digit form (e.g. "505551234") or null if invalid.
 */
export function validatePhone(raw: string): string | null {
  const cleaned = cleanPhone(raw);
  if (!cleaned) return null;

  // Take last 9 digits (handles +994…, 0…, 994… prefixes)
  const phone9 = cleaned.slice(-9);
  if (phone9.length !== 9) return null;

  const prefix = phone9.slice(0, 2);
  if (!(VALID_PREFIXES as readonly string[]).includes(prefix)) return null;

  const thirdDigit = phone9[2];
  if ((INVALID_THIRD_DIGITS as readonly string[]).includes(thirdDigit)) return null;

  return phone9;
}

/** Returns true if the phone number is valid */
export function isValidPhone(raw: string): boolean {
  return validatePhone(raw) !== null;
}

/** Format a 9-digit phone as +994 XX XXX XX XX */
export function formatPhone(phone9: string): string {
  return `+994 ${phone9.slice(0, 2)} ${phone9.slice(2, 5)} ${phone9.slice(5, 7)} ${phone9.slice(7, 9)}`;
}

/** Normalize raw input to +994XXXXXXXXX for storage */
export function normalizePhone(raw: string): string | null {
  const phone9 = validatePhone(raw);
  if (!phone9) return null;
  return `+994${phone9}`;
}

/**
 * Azerbaijan FIN code validation
 * - Exactly 7 alphanumeric characters (letters A-Z and digits 0-9)
 */
export function validateFin(raw: string): string | null {
  const upper = raw.trim().toUpperCase();
  if (/^[A-Z0-9]{7}$/.test(upper)) return upper;
  return null;
}
