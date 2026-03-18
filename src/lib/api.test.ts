import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Sentry
vi.mock('@sentry/sveltekit', () => ({
	captureException: vi.fn()
}));

// Mock config
vi.mock('./config', () => ({
	config: {
		environment: 'test',
		browserUrl: 'https://browser.testnet.partisiablockchain.com'
	}
}));

import { fetchApiJson } from './api';

describe('API', () => {
	describe('fetchApiJson', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('should return data on successful response', async () => {
			const mockData = { domain: 'mars', available: true };
			
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockData
			});

			const result = await fetchApiJson('/api/domains/mars');
			expect(result).toEqual(mockData);
		});

		it('should return error object on non-ok response with error message', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				json: async () => ({ error: 'Domain not found' })
			});

			const result = await fetchApiJson('/api/domains/mars');
			expect(result).toEqual({ error: 'Domain not found' });
		});

		it('should return generic error on non-ok response without error message', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: async () => ({})
			});

			const result = await fetchApiJson('/api/domains/mars');
			expect(result).toEqual({ error: 'Something went wrong' });
		});

		it('should return error on fetch failure', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

			const result = await fetchApiJson('/api/domains/mars');
			expect(result).toEqual({ error: 'Something went wrong' });
		});

		it('should pass through request options', async () => {
			const mockData = { success: true };
			const fetchSpy = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockData
			});
			global.fetch = fetchSpy;

			const options: RequestInit = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name: 'mars' })
			};

			await fetchApiJson('/api/register', options);

			expect(fetchSpy).toHaveBeenCalledWith('/api/register', options);
		});

		it('should capture exception on fetch error', async () => {
			const { captureException } = await import('@sentry/sveltekit');
			const error = new Error('Network error');
			global.fetch = vi.fn().mockRejectedValue(error);

			await fetchApiJson('/api/domains/mars');

			expect(captureException).toHaveBeenCalledWith(error, expect.any(Object));
		});
	});
});
