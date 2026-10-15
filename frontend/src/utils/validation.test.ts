import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone, isValidOtp } from './validation';

describe('Validation Utilities', () => {
  describe('Email validation (as per assignment spec)', () => {
    it('should reject incomplete or malformed emails', () => {
      expect(isValidEmail('abc')).toBe(false);
      expect(isValidEmail('abc@')).toBe(false);
      expect(isValidEmail('abc@gmail')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('  ')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });

    it('should accept valid complete emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@company.org')).toBe(true);
      expect(isValidEmail('test+alias@domain.co.uk')).toBe(true);
    });
  });

  describe('Phone validation', () => {
    it('should accept valid phone numbers', () => {
      expect(isValidPhone('+1 (555) 234-5678')).toBe(true);
      expect(isValidPhone('5551234567')).toBe(true);
      expect(isValidPhone('+44 20 7946 0958')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
    });
  });

  describe('OTP Code validation', () => {
    it('should only accept 6 numeric digits', () => {
      expect(isValidOtp('123456')).toBe(true);
      expect(isValidOtp('000000')).toBe(true);
      expect(isValidOtp('999999')).toBe(true);
      expect(isValidOtp('12345')).toBe(false);
      expect(isValidOtp('1234567')).toBe(false);
      expect(isValidOtp('12345a')).toBe(false);
      expect(isValidOtp('abcdef')).toBe(false);
    });
  });
});
