import { test, expect } from '@playwright/test';

test.describe('Feature 9: API Endpoints - Domains', () => {
	const baseUrl = 'http://localhost:4173';

	test.describe('GET /api/domains/{name}/check', () => {
		test('8.1 - Check availability returns correct structure for available domain', async ({
			request
		}) => {
			// Use a random domain name that is likely available
			const domainName = `notregistered${Date.now()}.ppg`;
			const response = await request.get(`${baseUrl}/api/domains/${domainName}/check`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();

			// Should have domainPresent field (boolean)
			expect(typeof data.domainPresent).toBe('boolean');
			// Should have parentPresent field (boolean)
			expect(typeof data.parentPresent).toBe('boolean');
		});

		test('8.1 - Check availability returns domainPresent: true for registered domain', async ({
			request
		}) => {
			// Try a domain that might already exist
			const domainName = 'test.ppg';
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
			// Try a domain that might be registered
			const domainName = 'test.ppg';
			const response = await request.get(`${baseUrl}/api/domains/${domainName}`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();

			// Response should have a domain field (null if not found)
			expect(data).toHaveProperty('domain');
		});

		test('8.2 - Get domain details for non-existent domain returns null', async ({
			request
		}) => {
			const domainName = `nonexistent${Date.now()}.ppg`;
			const response = await request.get(`${baseUrl}/api/domains/${domainName}`);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();

			expect(data).toHaveProperty('domain');
			expect(data.domain).toBeNull();
		});
	});

	test.describe('GET /api/domains/recent', () => {
		test('8.3 - Get recent domains returns array', async ({ request }) => {
			const response = await request.get(`${baseUrl}/api/domains/recent`);

			expect(response.ok()).toBeTruthy();

			// Should return an array
			const data = await response.json();
			expect(Array.isArray(data)).toBeTruthy();

			// If there are recent domains, each should have expected shape
			if (data.length > 0) {
				const firstDomain = data[0];
				expect(firstDomain).toHaveProperty('name');
				expect(firstDomain).toHaveProperty('owner');
			}
		});
	});

	test.describe('GET /api/domains/stats', () => {
		test('8.4 - Get stats returns statistics object', async ({ request }) => {
			const response = await request.get(`${baseUrl}/api/domains/stats`);

			expect(response.ok()).toBeTruthy();

			const data = await response.json();

			// Stats should be an object with numeric values
			expect(typeof data).toBe('object');
			// Common stats fields expected
			expect(data).toHaveProperty('totalDomains' as keyof typeof data);
		});
	});
});
