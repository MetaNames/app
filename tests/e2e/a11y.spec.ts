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

test('an invalid recipient address is programmatically invalid, not just red', async ({ page }) => {
	await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
	const input = page.locator('.mdc-text-field input').first();
	await input.fill('nope');

	await expect(page.locator('.mdc-text-field')).toHaveClass(/mdc-text-field--invalid/);
	await expect(input).toHaveAttribute('aria-invalid', 'true');
});
