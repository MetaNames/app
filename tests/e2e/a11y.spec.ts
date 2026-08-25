import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { ROUTES, gotoLoaded } from './routes';

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

// Both cases below judge whatever is on screen when they run, so what is on screen has to be the
// thing they name. `tests/e2e/routes.ts` carries the seven routes with a loaded-branch anchor and a
// fresh register name apiece; this file used to hard-code `/register/zzunregistered123` and
// `waitForTimeout(2000)` — the false-route and unproven-wait pair erratum E4 already closed for
// reflow. The two cases degrade in opposite directions when the 2 s runs out first, which is why
// neither was trustworthy: a spinner has no violations for axe to report, so `has no violations`
// goes green without ever scanning the route it names, while the same branch carries no `h1` at
// all (E6 measured `DOMAIN-LOADING h1=0` and `REGISTER-LOADING h1=0`), so `has exactly one
// level-one heading` goes red on a page it never saw. Both verdicts were about testnet latency
// beating a timer, not about the page.
test.describe('WCAG 2.2 A + AA', () => {
	for (const route of ROUTES) {
		test(`${route.name} has no violations`, async ({ page }) => {
			await gotoLoaded(page, route);

			const violations = await scan(page);
			expect(
				violations,
				violations.map((v) => `${v.impact} ${v.id} x${v.nodes.length}`).join('\n')
			).toEqual([]);
		});

		test(`${route.name} has exactly one level-one heading`, async ({ page }) => {
			await gotoLoaded(page, route);
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

// The register route's loading spinner used to be a bare CircularProgress — a silent animation.
// It now sits in a `role="status"` region that names what is being waited for, the same wrapper
// /domain gives its own spinner. Asserted on the unsettled branch on purpose: this test judges
// the wait, not the form, so it must not wait for the form.
test('the register page announces its loading state', async ({ page }) => {
	await page.goto(`/register/zzunregistered${Date.now()}`, { waitUntil: 'domcontentloaded' });

	const spinner = page.locator('div[role="status"][aria-label="Loading the registration form"]');
	await expect(spinner).toBeVisible({ timeout: 15000 });
	// The region itself carries the name — not its animated child, which comes and goes.
	await expect(spinner).toHaveAttribute('aria-label', /Loading/);
});

// Copy success was a purely visual checkmark; copy failure was already announced through the
// snackbar's role="status" surface. The success ping is a status element inside the chip, so
// grantClipboardPermissions + click has to make it appear. Skipped when the browser context
// cannot be granted clipboard access rather than red for an environment reason.
test('a successful chip copy is announced', async ({ browser }) => {
	const ctx = await browser.newContext();
	let granted = true;
	try {
		await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], {
			origin: process.env.E2E_ORIGIN || 'http://localhost:4173'
		});
	} catch {
		granted = false;
	}
	test.skip(!granted, 'clipboard permissions unsupported in this environment');

	const page = await ctx.newPage();
	await page.goto('/domain/test.mpc', { waitUntil: 'networkidle' });

	// The 'link' chip is type="text" even though it carries an href (see src/lib/chips.ts), so
	// clicking it copies instead of navigating — the one chip guaranteed to take the copy path.
	const chip = page.locator('button.chip:has-text("link")').first();
	await expect(chip).toBeVisible({ timeout: 15000 });
	await chip.click();

	await expect(chip.locator('[role="status"]')).toHaveText('Copied to the clipboard');
	await ctx.close();
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

/** The four things a ring has to be: on, drawn, thick enough, and 3:1 against what is behind it. */
async function expectRing(page: Page, sel: string) {
	const ring = await ringOn(page, sel);
	expect(ring.focusVisible, sel).toBe(true);
	expect(ring.style, sel).not.toBe('none');
	expect(ring.width, sel).toBeGreaterThanOrEqual(2);
	expect(ring.ratio, `${sel} on ${ring.backdrop}`).toBeGreaterThanOrEqual(3);
}

/** The wallet menu item selector — the list family MDC resets, reachable from every route. */
const MENU_ITEM = '.mdc-menu-surface--open .mdc-deprecated-list-item';

/**
 * Open the header wallet menu from the keyboard, retrying while SMUI's handler hydrates — the
 * same cold-start race `helpers.ts` documents for the click path.
 *
 * Keyboard rather than `click()` on purpose. Chromium only honours `:focus-visible` for a
 * programmatic `focus()` while the last input was a key press, so clicking here would make every
 * ring assertion below fail for a reason that has nothing to do with the CSS under test.
 */
async function openWalletMenuFromKeyboard(page: Page) {
	const item = page.locator(MENU_ITEM).first();

	for (let attempt = 1; attempt <= 5; attempt++) {
		await page.locator('button.mdc-top-app-bar__action-item').press('Enter');
		try {
			await expect(item).toBeVisible({ timeout: 3000 });
			return;
		} catch {
			await page.keyboard.press('Escape').catch(() => {});
		}
	}

	// Surface the real diagnostic rather than the last swallowed per-attempt timeout.
	await expect(item).toBeVisible({ timeout: 3000 });
}

/**
 * SC 2.4.7 was already met before this ring existed — MDC does indicate focus. SC 2.4.13 is what
 * the tint failed: 1.53:1 of change-of-contrast on the header button where 3:1 is asked for. So
 * measure the number, not merely the presence.
 *
 * The wallet menu item and the text input are here because a bare `:focus-visible` is (0,1,0) and
 * MDC resets `outline` on both families at (0,2,0) — `.mdc-deprecated-list-item:focus` and
 * `.mdc-text-field__input:focus`. Neither was in the original three-selector list, so both
 * computed `outline-style: none` under a rule that was supposed to be ringing them.
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
			await expectRing(page, sel);
		}

		// The menu sits on `.mdc-menu-surface` (#212125), not on the app bar behind it.
		await openWalletMenuFromKeyboard(page);
		await expectRing(page, MENU_ITEM);

		// `/domain/[name]` renders no enabled text input; the search field on `/` is the same
		// `.mdc-text-field__input` every Textfield in the app produces.
		await page.goto('/', { waitUntil: 'networkidle' });
		await expect(page.locator('.mdc-text-field__input').first()).toBeVisible({ timeout: 15000 });
		await expectRing(page, '.mdc-text-field__input');
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
