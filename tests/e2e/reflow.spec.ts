import { expect, test } from '@playwright/test';

import { ROUTES, gotoLoaded } from './routes';

/**
 * WCAG 2.2 SC 1.4.10 Reflow: content must be usable at 320 CSS px wide without
 * two-dimensional scrolling. 320 px is also what a 1280 px desktop looks like at
 * the 400 % zoom SC 1.4.10 names, so this one assertion covers both audiences.
 *
 * `scrollWidth <= clientWidth` also holds for a page that rendered nothing, which is why the
 * routes come from `routes.ts` with a loaded-branch anchor apiece rather than from a sleep.
 */

test.describe('reflow at 320 CSS px', () => {
	for (const route of ROUTES) {
		test(`${route.name} does not scroll horizontally`, async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 568 });
			await gotoLoaded(page, route);

			const { scrollWidth, clientWidth } = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth
			}));

			expect(
				scrollWidth,
				`${route.name}: ${scrollWidth}px of content in a ${clientWidth}px viewport`
			).toBeLessThanOrEqual(clientWidth);
		});
	}
});
