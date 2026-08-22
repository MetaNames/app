import { expect, test } from '@playwright/test';

test.describe('security response headers', () => {
	test('sets nosniff, a referrer policy and frame protection', async ({ request }) => {
		const response = await request.get('/');

		expect(response.headers()['x-content-type-options']).toBe('nosniff');
		expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
		expect(response.headers()['x-frame-options']).toBe('DENY');
	});
});
