import { expect, test } from '@playwright/test';

import { ROUTES, gotoLoaded } from './routes';

/**
 * Perceived speed on `/domain/[name]`: the route the audit measured at CLS 0.1492, and which
 * measured 0.1425 here — 0.1419 of it a single shift naming `DIV.content`.
 *
 * That shift is horizontal, not the footer jump the plan assumed (erratum E9). `.content` is
 * `align-self: center`, so it is shrink-to-fit, and the route's mobile media query used to reset
 * its `width: 100%` to `initial`: the loading branch was sized to its 32px spinner and the loaded
 * one to the 351px card. The footer jump is real but secondary — 0.0157 here, 0.0211 at 1280x720 —
 * and comes from `.content` being `flex-grow: 1`, so the loading branch is stretched to the
 * leftover viewport (603px) while the card needs 695.14px. Both assertions below name a source, so
 * a regression in either half is identifiable rather than just a number going up.
 *
 * `__cls` is 0 on a page that never rendered anything, so the measurement is only worth reading
 * once the route is provably showing its loaded branch — `gotoLoaded` supplies that anchor and the
 * path assertion that goes with it. See `routes.ts`: this route redirects to `/` when the chain
 * read fails and to `/register/<name>` on a confirmed absence, and both of those pages carry an
 * `h1` and shift far less, so a gate that only waits for a heading can report a green CLS for a
 * page it was never asked to measure.
 */

const DOMAIN_ROUTE = ROUTES.find((route) => route.name === 'domain')!;

/** Layout-shift entries the page has attributed to itself, kept for the assertion below. */
type Shift = { value: number; sources: { tag: string; label: string }[] };

declare global {
	interface Window {
		__shifts: Shift[];
		__frames: number;
	}
}

const OBSERVE_SHIFTS = () => {
	window.__shifts = [];
	window.__frames = 0;

	new PerformanceObserver((list) => {
		for (const entry of list.getEntries() as (PerformanceEntry & {
			value: number;
			hadRecentInput: boolean;
			sources?: { node?: Element | null }[];
		})[]) {
			if (entry.hadRecentInput) continue;

			window.__shifts.push({
				value: entry.value,
				sources: (entry.sources ?? []).map((source) => {
					const node = source.node;
					if (!node) return { tag: 'unknown', label: 'unknown' };

					// Svelte's scoping class is the whole of `className` on some of these nodes, so the
					// tag is kept on its own: an assertion matching a bare tag name against the label
					// below would silently never fire.
					const klass = typeof node.className === 'string' ? node.className.trim() : '';
					const first = klass ? klass.split(/\s+/)[0] : '';
					return { tag: node.tagName, label: node.tagName + (first ? `.${first}` : '') };
				})
			});
			// Reset the settle counter: a shift that just landed means the layout is still moving.
			window.__frames = 0;
		}
	}).observe({ type: 'layout-shift', buffered: true });
};

/**
 * Wait until the layout stops moving, rather than for a fixed number of milliseconds.
 *
 * `layout-shift` entries are delivered at a rendering opportunity, so reading the total straight
 * after the card appears can miss the shift the card caused. A sleep long enough to be safe is a
 * guess about testnet latency (erratum E4); counting animation frames that added no new shift is
 * a fact about the page.
 */
const SETTLED_FRAMES = 30;

test.describe('/domain/[name] perceived speed', () => {
	// The audit measured this route at 390x844 with `isMobile`, and CLS is a ratio of the viewport:
	// the same footer jump scores 0.0211 in the 1280x720 default and 0.0157 on the phone the number
	// in the plan came from. Measure the shape the audit measured.
	test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

	test('opening a domain page does not shove the layout around', async ({ page }) => {
		await page.addInitScript(OBSERVE_SHIFTS);
		await gotoLoaded(page, DOMAIN_ROUTE);
		await page.waitForFunction((settled) => ++window.__frames >= settled, SETTLED_FRAMES, {
			polling: 'raf',
			timeout: 15000
		});

		const shifts = await page.evaluate(() => window.__shifts);
		const cls = shifts.reduce((total, shift) => total + shift.value, 0);
		const detail = shifts
			.map((s) => `${s.value.toFixed(4)} ${s.sources.map((source) => source.label).join(', ')}`)
			.join(' | ');
		const shiftsNaming = (matches: (source: Shift['sources'][number]) => boolean) =>
			shifts.filter((shift) => shift.sources.some(matches));

		expect(cls, `cumulative layout shift ${cls.toFixed(4)} — ${detail}`).toBeLessThanOrEqual(0.02);
		// Both halves of the fix, named. The box the spinner and the card share growing 32px→351px
		// wide is the 0.1419 shift; the footer being shoved down 92px is the 0.0157 one. A small
		// total that still moves either is the same defect, smaller. The footer is matched on its
		// tag because its only class is a Svelte scoping hash, which changes when the component does.
		expect(
			shiftsNaming((source) => source.label === 'DIV.content'),
			`.content was resized — ${detail}`
		).toEqual([]);
		expect(
			shiftsNaming((source) => source.tag === 'FOOTER'),
			`footer was shifted — ${detail}`
		).toEqual([]);
	});
});
