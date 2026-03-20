import { test, expect } from '@playwright/test';

/**
 * API tests for domain endpoints.
 * These tests call the actual blockchain via the SDK.
 */

test.describe('Feature 9: API Endpoints - Domains', () => {
	const baseUrl = 'http://localhost:4173';

	test.describe('GET /api/domains/{name}/check', () => {
		test('8.1 - Check availability returns correct structure for available domain', async ({
			request
		}) => {
			const domainName = `notregistered${Date.now()}.mpc`;
			const response = await request.get(`${baseUrl}/api/domains/${domainName}/check`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();

			expect(typeof data.domainPresent).toBe('boolean');
			expect(typeof data.parentPresent).toBe('boolean');
		});

		test('8.1 - Check availability returns domainPresent for registered domain', async ({
			request
		}) => {
			const domainName = 'test.mpc';
			const response = await request.get(`${baseUrl}/api/domains/${domainName}/check`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(typeof data.domainPresent).toBe('boolean');
		});
	});

	test.describe('GET /api/domains/{name}', () => {
		test('8.2 - Get domain details for existing domain returns domain data', async ({
			request
		}) => {
			const domainName = 'test.mpc';
			const response = await request.get(`${baseUrl}/api/domains/${domainName}`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data).toHaveProperty('domain');
		});

		test('8.2 - Get domain details for non-existent domain returns empty object', async ({
			request
		}) => {
			const domainName = `nonexistent${Date.now()}.mpc`;
			const response = await request.get(`${baseUrl}/api/domains/${domainName}`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			// When domain is not found, find() returns null
			expect(data.domain).toBeNull();
		});
	});

	test.describe('GET /api/domains/recent', () => {
		test('8.3 - Get recent domains returns array', async ({ request }) => {
			const response = await request.get(`${baseUrl}/api/domains/recent`);

			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect(Array.isArray(data)).toBeTruthy();

			if (data.length > 0) {
				const firstDomain = data[0];
				expect(firstDomain).toHaveProperty('name');
			}
		});
	});

	test.describe('GET /api/domains/stats', () => {
		test('8.4 - Get stats returns statistics object', async ({ request }) => {
			const response = await request.get(`${baseUrl}/api/domains/stats`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();

			expect(typeof data).toBe('object');
			expect(data).toHaveProperty('domainCount');
			expect(data).toHaveProperty('ownerCount');
			expect(data).toHaveProperty('recentDomains');
		});
	});
});
