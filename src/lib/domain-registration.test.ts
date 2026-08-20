import { describe, it, expect } from 'vitest';
import type { DomainFeesResponse, DomainPaymentParams, ApiError } from './types';

describe('Domain Registration - Types', () => {
	describe('DomainPaymentParams', () => {
		it('should have correct structure for payment parameters', () => {
			const params: DomainPaymentParams = {
				domainName: 'test',
				byocSymbol: 'ETH',
				years: 1,
				address: '0x1234567890123456789012345678901234567890'
			};

			expect(params.domainName).toBe('test');
			expect(params.byocSymbol).toBe('ETH');
			expect(params.years).toBe(1);
			expect(params.address).toBe('0x1234567890123456789012345678901234567890');
		});

		it('should accept multiple years for registration', () => {
			const params: DomainPaymentParams = {
				domainName: 'test',
				byocSymbol: 'ETH',
				years: 5,
				address: '0x1234567890123456789012345678901234567890'
			};

			expect(params.years).toBe(5);
		});
	});

	describe('DomainFeesResponse', () => {
		it('should have correct structure for fees response', () => {
			const fees: DomainFeesResponse = {
				feesLabel: 10,
				fees: '1000000000000000000',
				symbol: 'ETH',
				address: '0x1234567890123456789012345678901234567890'
			};

			expect(typeof fees.feesLabel).toBe('number');
			expect(typeof fees.fees).toBe('string');
			expect(fees.symbol).toBe('ETH');
			expect(fees.address).toMatch(/^0x/);
		});
	});
});

describe('Domain Registration - Error Handling', () => {
	describe('ApiError', () => {
		it('should correctly identify error response', () => {
			const error: ApiError = { error: 'Invalid coin' };
			expect(error.error).toBe('Invalid coin');
		});

		it('should handle empty error messages', () => {
			const error: ApiError = { error: '' };
			expect(error.error).toBe('');
		});
	});
});
