import { test, expect } from '@playwright/test';

test.describe('Feature 9: API Endpoints - Fees', () => {
	const baseUrl = 'http://localhost:4173';

	test.describe('GET /api/register/{name}/fees/{coin}', () => {
		test('8.5 - Get fees for valid domain and coin returns fee breakdown', async ({
			request
		}) => {
			const domainName = `testfees${Date.now()}`;
			const coin = 'BTC'; // Valid BYOC coin

			const response = await request.get(
				`${baseUrl}/api/register/${domainName}/fees/${coin}`
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();

			// Should have fee fields
			expect(data).toHaveProperty('fees');
			expect(typeof data.fees).toBe('string');
		});

		test('8.5 - Get fees for invalid coin returns error', async ({ request }) => {
			const domainName = `testfees${Date.now()}`;
			const invalidCoin = 'INVALID_COIN';

			const response = await request.get(
				`${baseUrl}/api/register/${domainName}/fees/${invalidCoin}`
			);

			// Should return 400 or error status for invalid coin
			expect(response.status()).toBeGreaterThanOrEqual(400);
			const data = await response.json();
			expect(data).toHaveProperty('error');
		});

		test('8.5 - Get fees for valid coins (PT, BTC, ETH, USDC) returns fee data', async ({
			request
		}) => {
			const domainName = `testfees${Date.now()}`;
			const validCoins = ['PT', 'BTC', 'ETH', 'USDC'];

			for (const coin of validCoins) {
				const response = await request.get(
					`${baseUrl}/api/register/${domainName}/fees/${coin}`
				);

				expect(response.ok()).toBeTruthy(`Coin ${coin} should be valid`);
				const data = await response.json();
				expect(data).toHaveProperty('fees');
			}
		});
	});
});
