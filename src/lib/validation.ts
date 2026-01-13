/**
 * Validation utilities for user input
 * Used across authentication, forms, and data entry
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Password complexity regex
 * Requires: at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;

/**
 * Maximum password length to prevent DoS attacks
 */
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Validates password against security requirements
 *
 * Requirements (per Story 2.1 AC):
 * - Minimum 8 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains number
 * - Contains special character (@$!%*?&)
 * - No whitespace
 *
 * @param password - The password string to validate
 * @returns PasswordValidationResult with valid flag and error array
 *
 * @example
 * ```typescript
 * const result = validatePassword('weak')
 * // { valid: false, errors: ['Password must be at least 8 characters', ...] }
 *
 * const result = validatePassword('SecureP@ss123')
 * // { valid: true, errors: [] }
 * ```
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Handle null/undefined/non-string inputs
  if (!password || typeof password !== 'string') {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    return { valid: false, errors };
  }

  // Check minimum length
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  // Check maximum length (prevent DoS)
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`);
  }

  // Check complexity requirements (only if password has content)
  if (password.length > 0 && !PASSWORD_REGEX.test(password)) {
    errors.push(
      'Password must contain uppercase, lowercase, number, and special character',
    );
  }

  // Check for whitespace
  if (password.includes(' ') || /\s/.test(password)) {
    errors.push('Password cannot contain spaces');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates email format
 *
 * @param email - The email string to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitizes user input to prevent XSS
 * Removes HTML tags and dangerous characters
 *
 * @param input - The string to sanitize
 * @returns Sanitized string safe for display
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}
