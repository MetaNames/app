import { expect, type Page } from '@playwright/test';

/**
 * The seven routes the reflow gate and the accessibility gate both walk, and the anchor that
 * proves each one arrived.
 *
 * `networkidle` fires on the shell, and a fixed sleep is a guess about testnet latency rather
 * than a fact about it — neither establishes that the branch under test rendered. With the chain
 * reads stalled, /domain serves a `role="status"` spinner, /register a bare one, and /renew and
 * /transfer an empty `.content` div; a gate that measures or scans one of those has reported on the
 * unsettled branch, not on the page it names. Erratum E4 pinned that for reflow; the a11y gate
 * landed with the same `waitForTimeout(2000)` and E8 closes it there too. Every anchor below
 * therefore exists only on its route's loaded branch.
 */

// A registered name redirects to /domain/<name>, and both gates would stay green while measuring
// that page instead. Date.now() keeps the register route on a name that cannot already be taken;
// the fixed `zzunregistered123` both gates used before is one testnet registration away from
// silently becoming a second /domain scan. Only the name varies — every test title below is
// derived from `route.name`, so Playwright's test IDs stay stable across workers and retries.
const unregisteredName = `zzunregistered${Date.now()}`;

export const ROUTES = [
	// The search card, not the SSR'd heading above it — it is the wider of the two.
	{ path: '/', name: 'home', anchor: '.domain-input' },
	{ path: '/domain/test.mpc', name: 'domain', anchor: 'button.chip:has-text("Owner")' },
	// The domain-name heading, which is the element that overflowed here.
	{ path: `/register/${unregisteredName}`, name: 'register', anchor: '.card-content h2' },
	// Unauthenticated: this covers the empty state, not the domains table.
	{ path: '/profile', name: 'profile', anchor: 'p:has-text("Connect your wallet")' },
	{ path: '/tld', name: 'tld', anchor: 'button.chip:has-text("Owner")' },
	{ path: '/domain/test.mpc/renew', name: 'renew', anchor: '.card-content h2' },
	{ path: '/domain/test.mpc/transfer', name: 'transfer', anchor: 'h2' }
] as const;

export type Route = (typeof ROUTES)[number];

/**
 * Navigate to `route` and return only once the page is provably the one that was asked for: it is
 * showing that route's loaded branch, and it is still on that route's path.
 *
 * The path assertion is the second half of the proof and is not redundant, because no anchor here
 * is unique to its route. `.card-content h2` is `DomainPayment`'s domain-name heading, which
 * /register and /renew both render; `button.chip:has-text("Owner")` is `Domain.svelte`'s Whois
 * chip, which /domain and /tld both render; /transfer's `h2` is looser still. Four of the seven
 * routes can also leave the path they were asked for while loading, so an anchor on its own can be
 * satisfied on a page the caller never asked for:
 *
 * - /domain/[name] → /domain/<lowercased> if the name was not normalised, /register/<name> on a
 *   confirmed absence, / if the read failed.
 * - /register/[name] → /domain/<name> if the name is already registered, /register/<parent> if the
 *   parent is missing, / if `analyze` threw or the check API returned an error.
 * - /renew and /transfer → / when their `load` returned `{ error }`; E6 measured exactly that
 *   (`early h1=0 url=…/renew`, `late h1=1 url=/`). Their /domain/<name> gotos fire after a
 *   transaction lands, which a read-only gate never reaches.
 *
 * What this catches is a redirect that has already landed. It does not prove none is in flight —
 * but of the seven, only /register can render its loaded branch with a `goto()` still pending,
 * because it sets the store the `{#if}` reads before it redirects. Both such branches are ruled
 * out for the route below: `unregisteredName` cannot be already registered, and a name with no dot
 * analyses to no `parentId`, so the missing-parent hop cannot fire either. Everywhere else the
 * loaded branch and the redirect are mutually exclusive.
 */
export async function gotoLoaded(page: Page, route: Route) {
	await page.goto(route.path, { waitUntil: 'networkidle' });
	await expect(page.locator(route.anchor).first()).toBeVisible({ timeout: 15000 });
	expect(new URL(page.url()).pathname, `${route.name} redirected away from ${route.path}`).toBe(
		route.path
	);
}
