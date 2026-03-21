import { test, expect } from '@playwright/test';

/**
 * API tests for fee endpoints.
 * These tests call the actual blockchain via the SDK (testnet).
 *
 * Uses TEST_COIN — the testnet token provisioned by the MetaNames protocol.
 * This is the only coin that works on testnet for fee queries.
 * Do not replace with BTC/ETH/USDC — these are mainnet-only.
 */

test.describe('Feature 9: API Endpoints - Fees', () => {
	const baseUrl = 'http://localhost:4173';

	test.describe('GET /api/register/{name}/fees/{coin}', () => {
		test('8.5 - Get fees for TEST_COIN returns fee breakdown with numeric value', async ({
			request
		}) => {
			const domainName = `testfees${Date.now()}`;

			// Give blockchain time to respond on testnet
			const response = await request.get(
				`${baseUrl}/api/register/${domainName}/fees/TEST_COIN`,
				{ timeout: 30000 }
			);

			expect(response.ok()).toBeTruthy();
			const data = await response.json();
			expect(data).toHaveProperty('fees');
			expect(typeof data.fees).toBe('string');
			// Fees must be a parseable number > 0
			expect(Number(data.fees)).toBeGreaterThan(0);
		});

		test('8.6 - Get fees for invalid coin returns error', async ({ request }) => {
			const domainName = `testfees${Date.now()}`;
			const invalidCoin = 'DEFINITELY_NOT_A_COIN_12345';

			const response = await request.get(
				`${baseUrl}/api/register/${domainName}/fees/${invalidCoin}`,
				{ timeout: 30000 }
			);

			// Should return 400 for invalid coin
			expect(response.status()).toBeGreaterThanOrEqual(400);
			const data = await response.json();
			expect(data).toHaveProperty('error');
		});
	});
});
