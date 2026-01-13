import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  validateEmail,
  sanitizeInput,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '@/lib/validation';

describe('Password Validation', () => {
  describe('Length Requirements', () => {
    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
    });

    it('should reject password with 7 characters', () => {
      const result = validatePassword('Test12!'); // 7 chars
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
    });

    it('should accept password with exactly 8 characters', () => {
      const result = validatePassword('Test1234!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept password with 20 characters', () => {
      const result = validatePassword('Test1234!ExtraSecure');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject very long password (> 128 chars)', () => {
      const longPassword = 'A1!' + 'x'.repeat(130);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`,
      );
    });

    it('should accept password at max length (128 chars)', () => {
      const maxPassword = 'Aa1!' + 'x'.repeat(PASSWORD_MAX_LENGTH - 4);
      const result = validatePassword(maxPassword);
      expect(result.valid).toBe(true);
    });
  });

  describe('Complexity Requirements', () => {
    it('should reject password without uppercase letter', () => {
      const result = validatePassword('test1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('TEST1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    });

    it('should reject password without number', () => {
      const result = validatePassword('TestTest!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Test1234');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    });

    it('should accept password with all complexity requirements', () => {
      const result = validatePassword('SecureP@ss123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept password with all allowed special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '*', '?', '&'];
      specialChars.forEach((char) => {
        const result = validatePassword(`Test1234${char}`);
        expect(result.valid).toBe(true, `Failed for special char: ${char}`);
      });
    });
  });

  describe('Whitespace Handling', () => {
    it('should reject password with spaces', () => {
      const result = validatePassword('Test 1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password cannot contain spaces');
    });

    it('should reject password with leading space', () => {
      const result = validatePassword(' Test1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password cannot contain spaces');
    });

    it('should reject password with trailing space', () => {
      const result = validatePassword('Test1234! ');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password cannot contain spaces');
    });

    it('should reject password with tab character', () => {
      const result = validatePassword('Test\t1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password cannot contain spaces');
    });

    it('should reject password with newline character', () => {
      const result = validatePassword('Test\n1234!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password cannot contain spaces');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null input gracefully', () => {
      const result = validatePassword(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle undefined input gracefully', () => {
      const result = validatePassword(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-string input gracefully', () => {
      const result = validatePassword(12345 as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle object input gracefully', () => {
      const result = validatePassword({} as any);
      expect(result.valid).toBe(false);
    });
  });

  describe('Multiple Errors', () => {
    it('should return all applicable errors for "test"', () => {
      const result = validatePassword('test');
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
      expect(result.errors).toContain(
        'Password must contain uppercase, lowercase, number, and special character',
      );
    });

    it('should return multiple errors for password with space and insufficient length', () => {
      const result = validatePassword('te st');
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors.some((e) => e.includes('8 characters'))).toBe(true);
      expect(result.errors.some((e) => e.includes('spaces'))).toBe(true);
    });
  });

  describe('Real-World Password Examples', () => {
    it('should accept common strong password patterns', () => {
      const strongPasswords = [
        'Welcome123!',
        'MyP@ssw0rd',
        'Secure#2024',
        'Admin$123',
        'Test!ng456',
      ];

      strongPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true, `Failed for password: ${password}`);
      });
    });

    it('should reject common weak password patterns', () => {
      const weakPasswords = [
        'password', // No upper, no number, no special
        'PASSWORD', // No lower, no number, no special
        '12345678', // No upper, no lower, no special
        'Password', // No number, no special
        'Password1', // No special
      ];

      weakPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(false, `Should reject: ${password}`);
      });
    });
  });
});

describe('Email Validation', () => {
  it('should accept valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should accept email with subdomain', () => {
    expect(validateEmail('test@mail.example.com')).toBe(true);
  });

  it('should reject email without @', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  it('should reject email without domain', () => {
    expect(validateEmail('test@')).toBe(false);
  });

  it('should reject empty email', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('should handle null gracefully', () => {
    expect(validateEmail(null as any)).toBe(false);
  });

  it('should trim whitespace', () => {
    expect(validateEmail('  test@example.com  ')).toBe(true);
  });
});

describe('Input Sanitization', () => {
  it('should escape HTML tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
    );
  });

  it('should escape quotes', () => {
    const result = sanitizeInput('He said "hello"');
    expect(result).toBe('He said &quot;hello&quot;');
  });

  it('should escape single quotes', () => {
    const result = sanitizeInput("It's working");
    expect(result).toBe('It&#x27;s working');
  });

  it('should trim whitespace', () => {
    const result = sanitizeInput('  test  ');
    expect(result).toBe('test');
  });

  it('should handle empty string', () => {
    const result = sanitizeInput('');
    expect(result).toBe('');
  });

  it('should handle null gracefully', () => {
    const result = sanitizeInput(null as any);
    expect(result).toBe('');
  });
});
