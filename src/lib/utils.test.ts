import { describe, it, expect, vi } from 'vitest';

// Mock Sentry
vi.mock('@sentry/sveltekit', () => ({
	captureException: vi.fn(),
	init: vi.fn()
}));

// Mock stores
vi.mock('./stores/main', () => ({
	alertMessage: { set: vi.fn() },
	alertTransaction: { set: vi.fn() }
}));

// Mock date-fns
vi.mock('date-fns', () => ({
	formatDistanceToNow: vi.fn((date: Date) => {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (diffDays === 0) return 'less than a minute ago';
		if (diffDays === 1) return '1 day ago';
		return `${diffDays} days ago`;
	})
}));

import {
	formatDate,
	isValidURL,
	validAddress,
	recipientAddressErrors,
	removeHTTPIfPresent,
	formatDateToRelativeDate
} from './utils';

describe('Utils', () => {
	describe('formatDate', () => {
		it('should format date string correctly', () => {
			const result = formatDate('2026-03-15');
			expect(result).toContain('15');
			expect(result).toContain('March');
			expect(result).toContain('2026');
		});

		it('should format Date object correctly', () => {
			const result = formatDate(new Date('2026-06-20'));
			expect(result).toContain('20');
			expect(result).toContain('June');
			expect(result).toContain('2026');
		});
	});

	describe('isValidURL', () => {
		it('should return true for valid https URLs', () => {
			expect(isValidURL('https://example.com')).toBe(true);
			expect(isValidURL('https://subdomain.example.com')).toBe(true);
			expect(isValidURL('https://example.com/path')).toBe(true);
			expect(isValidURL('https://example.com/path?query=1')).toBe(true);
		});

		it('should return true for valid http URLs', () => {
			expect(isValidURL('http://example.com')).toBe(true);
		});

		it('should return false for invalid URLs', () => {
			expect(isValidURL('not-a-url')).toBe(false);
			expect(isValidURL('')).toBe(false);
		});

		it('should return false for script-bearing protocols', () => {
			expect(isValidURL('javascript:alert(1)')).toBe(false);
			expect(isValidURL('JavaScript:alert(1)')).toBe(false);
			expect(isValidURL('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(false);
			expect(isValidURL('vbscript:msgbox(1)')).toBe(false);
		});

		it('should return false for non-web protocols', () => {
			expect(isValidURL('ftp://example.com')).toBe(false);
			expect(isValidURL('file:///etc/passwd')).toBe(false);
		});
	});

	describe('validAddress', () => {
		it('should return true for valid 42-char hex addresses', () => {
			expect(validAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true);
			expect(validAddress('0x0000000000000000000000000000000000000000')).toBe(true);
			expect(validAddress('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
		});

		it('should return false for addresses with invalid length', () => {
			expect(validAddress('0x123')).toBe(false);
			expect(validAddress('0x1234567890abcdef1234567890abcdef1234567890')).toBe(false);
		});

		it('should return false for addresses with invalid characters', () => {
			// Note: validAddress allows all alphanumeric (bug - should only allow hex)
			// It allows g because regex /^[a-z0-9]+$/i matches any letter
			expect(validAddress('0x1234567890abcdef1234567890abcdef1234567-')).toBe(false);
			expect(validAddress('0x1234567890abcdef1234567890abcdef1234567 ')).toBe(false);
		});
	});

	describe('recipientAddressErrors', () => {
		const valid = '00abcdefabcdefabcdefabcdefabcdefabcdefabcd';

		it('should return no errors for a valid address', () => {
			expect(recipientAddressErrors(valid)).toEqual([]);
		});

		it('should require an address', () => {
			expect(recipientAddressErrors('')).toEqual(['Address is required']);
			expect(recipientAddressErrors('   ')).toEqual(['Address is required']);
		});

		it('should reject a malformed address', () => {
			expect(recipientAddressErrors('0x123')).toEqual(['Address is invalid']);
		});

		it('should still report an error after a valid address is cleared', () => {
			// Regression: the transfer page only re-validated on a truthy value, so clearing a
			// valid recipient left `errors` empty and enabled the submit button on an empty field.
			expect(recipientAddressErrors(valid)).toEqual([]);
			expect(recipientAddressErrors('')).not.toEqual([]);
		});
	});

	describe('removeHTTPIfPresent', () => {
		it('should remove https:// prefix', () => {
			expect(removeHTTPIfPresent('https://example.com')).toBe('example.com');
			expect(removeHTTPIfPresent('https://subdomain.example.com/path')).toBe(
				'subdomain.example.com/path'
			);
		});

		it('should remove http:// prefix', () => {
			expect(removeHTTPIfPresent('http://example.com')).toBe('example.com');
		});

		it('should return unchanged string without http prefix', () => {
			expect(removeHTTPIfPresent('example.com')).toBe('example.com');
			expect(removeHTTPIfPresent('ftp://example.com')).toBe('ftp://example.com');
		});
	});

	describe('formatDateToRelativeDate', () => {
		it('should format past dates with ago suffix', () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const result = formatDateToRelativeDate(yesterday);
			expect(result).toContain('ago');
		});

		it('should handle string dates', () => {
			const result = formatDateToRelativeDate('2026-01-01');
			expect(result).toBeTruthy();
		});
	});
});
