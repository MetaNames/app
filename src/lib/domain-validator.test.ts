import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DomainValidator } from '@metanames/sdk';

// Create a mock DomainValidator for testing
describe('DomainValidator', () => {
	let validator: DomainValidator;

	beforeEach(() => {
		validator = new DomainValidator('test');
	});

	describe('validation', () => {
		it('should validate correct domain names', () => {
			expect(validator.validate('valid', { raiseError: false })).toBe(true);
			expect(validator.validate('abc', { raiseError: false })).toBe(true);
			expect(validator.validate('hello-world', { raiseError: false })).toBe(true);
		});

		it('should reject empty domain names', () => {
			expect(validator.validate('', { raiseError: false })).toBe(false);
		});

		it('should reject domain names with invalid characters', () => {
			// Domain with spaces is invalid
			expect(validator.validate('domain with spaces', { raiseError: false })).toBe(false);
			// Domain with double dots is invalid
			expect(validator.validate('domain..test', { raiseError: false })).toBe(false);
		});

		it('should reject domain names longer than max length', () => {
			const longName = 'a'.repeat(33); // max is 32
			expect(validator.validate(longName, { raiseError: false })).toBe(false);
		});

		it('should get validation errors', () => {
			validator.validate('', { raiseError: false });
			const errors = validator.getErrors();
			expect(errors.length).toBeGreaterThan(0);
		});
	});

	describe('normalize', () => {
		it('should normalize domain names to lowercase', () => {
			expect(validator.normalize('HELLO')).toBe('hello');
			expect(validator.normalize('World')).toBe('world');
			expect(validator.normalize('MixedCase')).toBe('mixedcase');
		});

		it('should remove TLD when option is set', () => {
			const validatorWithTld = new DomainValidator('test');
			expect(validatorWithTld.normalize('domain.test', { removeTLD: true })).toBe('domain');
		});
	});

	describe('rules', () => {
		it('should have correct min and max length rules', () => {
			expect(validator.rules.minLength).toBe(1);
			expect(validator.rules.maxLength).toBe(32);
		});
	});
});
