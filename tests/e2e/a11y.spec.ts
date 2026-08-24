import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

type Violation = { id: string; impact: string; nodes: { target: string[] }[] };

async function scan(page: Page): Promise<Violation[]> {
	await page.addScriptTag({ content: AXE });
	return page.evaluate(async (tags) => {
		// @ts-expect-error injected by addScriptTag
		const result = await window.axe.run(document, {
			runOnly: { type: 'tag', values: tags },
			resultTypes: ['violations']
		});
		return result.violations.map((v: Violation) => ({
			id: v.id,
			impact: v.impact,
			nodes: v.nodes.map((n) => ({ target: n.target }))
		}));
	}, TAGS);
}

const ROUTES = [
	['/', 'home'],
	['/domain/test.mpc', 'domain'],
	['/register/zzunregistered123', 'register'],
	['/profile', 'profile'],
	['/tld', 'tld'],
	['/domain/test.mpc/renew', 'renew'],
	['/domain/test.mpc/transfer', 'transfer']
] as const;

test.describe('WCAG 2.2 A + AA', () => {
	for (const [path, name] of ROUTES) {
		test(`${name} has no violations`, async ({ page }) => {
			await page.goto(path, { waitUntil: 'networkidle' });
			await page.waitForTimeout(2000);

			const violations = await scan(page);
			expect(
				violations,
				violations.map((v) => `${v.impact} ${v.id} x${v.nodes.length}`).join('\n')
			).toEqual([]);
		});

		test(`${name} has exactly one level-one heading`, async ({ page }) => {
			await page.goto(path, { waitUntil: 'networkidle' });
			await page.waitForTimeout(2000);
			await expect(page.locator('h1')).toHaveCount(1);
		});
	}
});

test('the search result is inside a live region', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	await page.locator('.mdc-text-field input').first().fill('test');

	const result = page.locator('[data-testid^="domain-result"]');
	await expect(result).toBeVisible({ timeout: 15000 });

	const announced = await result.evaluate((el) => {
		for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
			if (n.getAttribute('aria-live')) return true;
			if (['status', 'alert', 'log'].includes(n.getAttribute('role') ?? '')) return true;
		}
		return false;
	});
	expect(announced, 'no aria-live / role=status ancestor').toBe(true);
});

test('an invalid recipient address is programmatically invalid, not just red', async ({ page }) => {
	await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
	const input = page.locator('.mdc-text-field input').first();
	await input.fill('nope');

	await expect(page.locator('.mdc-text-field')).toHaveClass(/mdc-text-field--invalid/);
	await expect(input).toHaveAttribute('aria-invalid', 'true');
});

/**
 * The focus ring as a sighted keyboard user meets it: how thick, and how far it stands off the
 * thing behind it. MDC paints most controls transparent, so the backdrop to compare against is
 * the nearest ancestor that actually has an opaque background, not the control itself.
 */
async function ringOn(page: Page, selector: string) {
	return page.evaluate((sel) => {
		const el = document.querySelector<HTMLElement>(sel);
		if (!el) throw new Error(`no element matched ${sel}`);
		el.focus();

		const channels = (colour: string) => (colour.match(/[\d.]+/g) ?? []).map(Number);
		const luminance = (colour: string) => {
			const [r, g, b] = channels(colour)
				.slice(0, 3)
				.map((v) => v / 255)
				.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};

		let backdrop = 'rgb(0, 0, 0)';
		for (let node = el.parentElement; node; node = node.parentElement) {
			const bg = getComputedStyle(node).backgroundColor;
			const alpha = channels(bg)[3];
			if (alpha === undefined || alpha > 0.5) {
				backdrop = bg;
				break;
			}
		}

		const style = getComputedStyle(el);
		const [lighter, darker] = [luminance(style.outlineColor), luminance(backdrop)].sort(
			(a, b) => b - a
		);
		return {
			focusVisible: el.matches(':focus-visible'),
			style: style.outlineStyle,
			width: parseFloat(style.outlineWidth),
			backdrop,
			ratio: (lighter + 0.05) / (darker + 0.05)
		};
	}, selector);
}

/**
 * SC 2.4.7 was already met before this ring existed — MDC does indicate focus. SC 2.4.13 is what
 * the tint failed: 1.53:1 of change-of-contrast on the header button where 3:1 is asked for. So
 * measure the number, not merely the presence.
 *
 * Both widths are checked because a ring is only useful if it survives magnification, and 320 CSS
 * px is what a 1280 px desktop looks like at the 400 % zoom SC 1.4.10 names — the same proxy
 * `reflow.spec.ts` uses.
 */
for (const [zoom, width] of [
	['unzoomed', 1280],
	['at 400% zoom', 320]
] as const) {
	test(`every focusable control gets a visible, contrasting outline ${zoom}`, async ({ page }) => {
		await page.setViewportSize({ width, height: 720 });
		await page.goto('/domain/test.mpc', { waitUntil: 'networkidle' });
		await expect(page.locator('button.chip').first()).toBeVisible({ timeout: 15000 });

		for (const sel of ['a.link-logo', 'button.mdc-top-app-bar__action-item', 'button.chip']) {
			const ring = await ringOn(page, sel);
			expect(ring.focusVisible, sel).toBe(true);
			expect(ring.style, sel).not.toBe('none');
			expect(ring.width, sel).toBeGreaterThanOrEqual(2);
			expect(ring.ratio, `${sel} on ${ring.backdrop}`).toBeGreaterThanOrEqual(3);
		}
	});
}

// MDC inverts the snackbar: `.mdc-snackbar__surface` is #d3d3d3, the one light surface in this
// dark theme, and the ring that reads at 3.35:1 on the app bar is 1.06:1 on it. Covered
// separately because it is the case the plan's three-backdrop check missed — see erratum E7.
test('the snackbar ring survives its inverted surface', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	// Both snackbars sit in the DOM at `display: none`. Adding the class MDC itself adds renders
	// the real surface without needing a chain transaction to land first.
	await page.evaluate(() =>
		document.querySelector('.mdc-snackbar')?.classList.add('mdc-snackbar--open')
	);

	for (const sel of [
		'.mdc-snackbar__surface button.mdc-button',
		'.mdc-snackbar__surface button.mdc-icon-button'
	]) {
		const ring = await ringOn(page, sel);
		expect(ring.width, sel).toBeGreaterThanOrEqual(2);
		expect(ring.ratio, `${sel} on ${ring.backdrop}`).toBeGreaterThanOrEqual(3);
	}
});

test('reduced motion is honoured without hiding what was animating', async ({ browser }) => {
	const ctx = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await ctx.newPage();
	await page.goto('/', { waitUntil: 'networkidle' });

	const duration = await page
		.locator('button.mdc-top-app-bar__action-item')
		.evaluate((n) => getComputedStyle(n).transitionDuration);
	expect(parseFloat(duration)).toBeLessThan(0.05);

	// Collapsing every duration to ~0 is only safe if the end state is the visible one. The wallet
	// menu opens on a transform-and-opacity transition, so it is the honest check that the rule
	// suppresses the motion rather than the content.
	await page.locator('button.mdc-top-app-bar__action-item').press('Enter');
	await expect(
		page.locator('.mdc-menu-surface--open .mdc-deprecated-list-item').first()
	).toBeVisible();

	await ctx.close();
});
