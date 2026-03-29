import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { fetchApiJson } from './api';
import type { DomainFeesResponse, DomainPaymentParams, ApiError } from './types';

describe('Domain Registration - API Functions', () => {
	describe('fetchApiJson', () => {
		beforeEach(() => {
			global.fetch = vi.fn();
		});

		it('should return JSON data on successful response', async () => {
			const mockData: DomainFeesResponse = {
				feesLabel: 10,
				fees: '1000000000000000000',
				symbol: 'ETH',
				address: '0x1234567890123456789012345678901234567890'
			};

			(global.fetch as unknown as Mock).mockResolvedValueOnce({
				ok: true,
				json: async () => mockData
			});

			const result = await fetchApiJson<DomainFeesResponse>('/api/register/test/fees/ETH');

			expect(result).toEqual(mockData);
		});

		it('should return ApiError on non-ok response with error message', async () => {
			(global.fetch as unknown as Mock).mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: 'Domain not available' })
			});

			const result = await fetchApiJson<DomainFeesResponse>('/api/register/test/fees/ETH');

			expect(result).toEqual({ error: 'Domain not available' });
		});

		it('should return default error message when no error details provided', async () => {
			(global.fetch as unknown as Mock).mockResolvedValueOnce({
				ok: false,
				json: async () => ({})
			});

			const result = await fetchApiJson<DomainFeesResponse>('/api/register/test/fees/ETH');

			expect(result).toEqual({ error: 'Something went wrong' });
		});

		it('should return ApiError on network failure', async () => {
			(global.fetch as unknown as Mock).mockRejectedValueOnce(new Error('Network error'));

			const result = await fetchApiJson<DomainFeesResponse>('/api/register/test/fees/ETH');

			expect(result).toEqual({ error: 'Something went wrong' });
		});
	});
});

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
