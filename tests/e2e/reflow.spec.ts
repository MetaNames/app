import { expect, test } from '@playwright/test';

/**
 * WCAG 2.2 SC 1.4.10 Reflow: content must be usable at 320 CSS px wide without
 * two-dimensional scrolling. 320 px is also what a 1280 px desktop looks like at
 * the 400 % zoom SC 1.4.10 names, so this one assertion covers both audiences.
 */
const ROUTES = [
	['/', 'home'],
	['/domain/test.mpc', 'domain'],
	['/register/zzunregistered123', 'register'],
	['/profile', 'profile'],
	['/tld', 'tld'],
	['/domain/test.mpc/renew', 'renew'],
	['/domain/test.mpc/transfer', 'transfer']
] as const;

test.describe('reflow at 320 CSS px', () => {
	for (const [path, name] of ROUTES) {
		test(`${name} does not scroll horizontally`, async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 568 });
			await page.goto(path, { waitUntil: 'networkidle' });
			// The chain read behind /domain and /register resolves after hydration.
			await page.waitForTimeout(2000);

			const { scrollWidth, clientWidth } = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth
			}));

			expect(
				scrollWidth,
				`${name}: ${scrollWidth}px of content in a ${clientWidth}px viewport`
			).toBeLessThanOrEqual(clientWidth);
		});
	}
});
