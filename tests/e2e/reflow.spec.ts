import { expect, test } from '@playwright/test';

/**
 * WCAG 2.2 SC 1.4.10 Reflow: content must be usable at 320 CSS px wide without
 * two-dimensional scrolling. 320 px is also what a 1280 px desktop looks like at
 * the 400 % zoom SC 1.4.10 names, so this one assertion covers both audiences.
 *
 * `scrollWidth <= clientWidth` also holds for a page that rendered nothing, so waiting on
 * `networkidle` plus a fixed sleep did not prove there was a layout to measure: with the
 * chain reads stalled, /domain and /register both reported 320 px of content in a 320 px
 * viewport and passed, off 17 elements under `main` — a spinner, not a layout. Each route
 * therefore carries an anchor that only exists on its loaded branch.
 */

// A registered name redirects to /domain/<name>, and this test would stay green while
// measuring that page instead. Date.now() keeps it on a name that cannot already be taken.
const unregisteredName = `zzunregistered${Date.now()}`;

const ROUTES = [
	// The search card, not the SSR'd heading above it — it is the wider of the two.
	['/', 'home', '.domain-input'],
	['/domain/test.mpc', 'domain', 'button.chip:has-text("Owner")'],
	// The domain-name heading, which is the element that overflowed here.
	[`/register/${unregisteredName}`, 'register', '.card-content h2'],
	// Unauthenticated: this covers the empty state, not the domains table.
	['/profile', 'profile', 'p:has-text("Connect your wallet")'],
	['/tld', 'tld', 'button.chip:has-text("Owner")'],
	['/domain/test.mpc/renew', 'renew', '.card-content h2'],
	['/domain/test.mpc/transfer', 'transfer', 'h2']
] as const;

test.describe('reflow at 320 CSS px', () => {
	for (const [path, name, anchor] of ROUTES) {
		test(`${name} does not scroll horizontally`, async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 568 });
			await page.goto(path, { waitUntil: 'networkidle' });
			// The chain read behind /domain and /register resolves after hydration.
			await expect(page.locator(anchor).first()).toBeVisible({ timeout: 15000 });

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
