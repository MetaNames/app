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

		test('8.1b - Check returns domainPresent=true for registered domain', async ({ request }) => {
			const domainName = 'test.mpc';
			const response = await request.get(`${baseUrl}/api/domains/${domainName}/check`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data.domainPresent).toBe(true);
		});
	});

	test.describe('GET /api/domains/{name}', () => {
		test('8.2 - Get domain details for existing domain returns full domain data', async ({
			request
		}) => {
			const domainName = 'test.mpc';
			const response = await request.get(`${baseUrl}/api/domains/${domainName}`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data).toHaveProperty('domain');
			expect(data.domain).not.toBeNull();
			expect(data.domain).toHaveProperty('name');
			expect(data.domain.name).toBe('test.mpc');
			expect(data.domain).toHaveProperty('owner');
			expect(typeof data.domain.owner).toBe('string');
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
		test('8.3 - Get recent domains returns non-empty array with domain names', async ({
			request
		}) => {
			const response = await request.get(`${baseUrl}/api/domains/recent`, { timeout: 30000 });

			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect(Array.isArray(data)).toBeTruthy();
			// Testnet has 400+ domains — recent list must not be empty
			expect(data.length).toBeGreaterThan(0);

			const firstDomain = data[0];
			expect(firstDomain).toHaveProperty('name');
			expect(typeof firstDomain.name).toBe('string');
			expect(firstDomain.name.length).toBeGreaterThan(0);
		});
	});

	test.describe('GET /api/domains/stats', () => {
		test('8.4 - Get stats returns valid statistics', async ({ request }) => {
			const response = await request.get(`${baseUrl}/api/domains/stats`, {
				timeout: 30000
			});

			expect(response.ok()).toBeTruthy();
			const data = await response.json();

			// Stats structure
			expect(typeof data).toBe('object');
			expect(data).toHaveProperty('domainCount');
			expect(data).toHaveProperty('ownerCount');
			expect(data).toHaveProperty('recentDomains');

			// Testnet has 400+ domains and multiple owners — counts must be positive
			expect(typeof data.domainCount).toBe('number');
			expect(typeof data.ownerCount).toBe('number');
			expect(data.domainCount).toBeGreaterThan(0);
			expect(data.ownerCount).toBeGreaterThan(0);

			// recentDomains is an array of domain projections
			expect(Array.isArray(data.recentDomains)).toBeTruthy();
			for (const domain of data.recentDomains) {
				expect(typeof domain.name).toBe('string');
				expect(domain.name.length).toBeGreaterThan(0);
			}
		});
	});
});
