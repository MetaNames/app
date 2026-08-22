# MetaNames App Refactoring Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Restore working lint/typecheck/test tooling, pin current behaviour with characterization tests, then remove the duplicated config, duplicated transaction boilerplate, and scattered SDK calls that make the domain register/renew/transfer flows fragile — without changing any user-visible behaviour.

**Architecture:** Keep SvelteKit + Svelte 4 + SMUI exactly as-is. Introduce one thin, fully-unit-tested layer under `src/lib/` (`contracts.ts`, `env.ts`, `transaction.ts`, `services/domain.ts`, `search.ts`, `sort.ts`) that components delegate to, so blockchain flows become testable in Node without a wallet or a DOM. Every extraction is a mechanical move preceded by a characterization test that pins today's behaviour; components keep their current markup and props.

**Tech Stack:** SvelteKit 2 / Svelte 4, TypeScript 5.6 (strict), SMUI 7, `@metanames/sdk` 6.3, `@partisiablockchain/abi-client`, `partisia-blockchain-applications-sdk`, `@ledgerhq/hw-transport-webusb`, Sentry, Vite 5, Vitest 2, Playwright 1.48, Prettier 3 + `prettier-plugin-svelte`, ESLint 9, Yarn 1.22.

---

## AUDIT SUMMARY

### Structure overview

66 files under `src/`, **3,554 lines** of `.ts`/`.svelte`/`.js`.

| Area                  | Files                      | Notes                                                                                                                                 |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/` (pages) | 13 `.svelte`, 3 `+page.ts` | home, `domain/[name]`, `register/[name]`, `renew`, `transfer`, `profile`, `tld`, `proposals/tld-migration`                            |
| `src/routes/api/`     | 7 `+server.ts`             | domain lookup/check/recent/stats, mint fees, proposal voter add/remove                                                                |
| `src/components/`     | 9 `.svelte`                | `Domain` (226 L), `DomainPayment` (225 L), `Records`, `Record`, `Chip`, `LoadingButton`, `Icon`, `ConnectionRequired`, `GoBackButton` |
| `src/lib/`            | 10 `.ts`                   | `config`, `sdk`, `api`, `wallet`, `utils`, `url`, `types`, `error`, `proposal`, `index` (barrel)                                      |
| `src/lib/stores/`     | 2 `.ts`                    | `main.ts` (walletAddress/alert/refresh), `sdk.ts` (SDK + selected coin)                                                               |
| `src/lib/server/`     | 2 `.ts`                    | server-side SDK singleton, `handleError`, stats; separate server `config.ts`                                                          |
| Tests                 | 2 files                    | `src/index.test.ts`, `tests/test.ts` — both framework boilerplate                                                                     |

Largest files: `src/components/Domain.svelte` (226), `src/components/DomainPayment.svelte` (225), `src/routes/+layout.svelte` (204), `src/routes/proposals/tld-migration/+page.svelte` (191), `src/routes/DomainSearch.svelte` (182).

### Tooling state (measured, not estimated)

| Command                    | Real result                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn check`               | **Does not run svelte-check at all.** Yarn 1's built-in `check` command shadows the npm script. Output: `error "svelte-check#fdir#picomatch@^3 \|\| ^4" doesn't satisfy found match of "picomatch@2.3.1"` → exit 1. The script only runs via `yarn run check`.                                                                                                                                                                                            |
| `yarn run check`           | **3 errors, 0 warnings, 3 files.** (1) `src/lib/server/config.ts:2` — `Module '"$env/static/private"' has no exported member 'PROPOSALS_WALLET_PRIVATE_KEY'`; (2) `src/components/DomainPayment.svelte:151` — `Type '(error: Error) => Promise<void>' is not assignable to type '(error: unknown) => Promise<void>'`; (3) `node_modules/@smui/banner/src/Banner.types.ts:1` — `Cannot access ambient const enums when 'verbatimModuleSyntax' is enabled`. |
| `yarn lint`                | **Fails, and never lints.** Prettier stops first: `[warn] .jules/palette.md`, exit 1. Running the second half alone (`npx eslint .`) exits **2** with `ESLint couldn't find an eslint.config.(js\|mjs\|cjs) file` — ESLint 9.13 requires flat config, the repo ships `.eslintrc.cjs`. Plus `ESLintIgnoreWarning: The ".eslintignore" file is no longer supported`. **Zero files have been linted since the ESLint 9 bump.**                               |
| `yarn run test:unit --run` | **1 test file, 1 test, passes in 2 ms** — `src/index.test.ts` asserts `1 + 2 === 3`. That is the entire unit suite.                                                                                                                                                                                                                                                                                                                                       |
| `npx playwright test`      | **Cannot run:** no browsers installed (`~/.cache/ms-playwright` absent). The only spec, `tests/test.ts:4`, asserts an `h1` reading `Welcome to SvelteKit`; the home page renders `<h3>Find your Meta Name</h3>` (`src/routes/+page.svelte:11`), so it **would fail** if browsers were installed.                                                                                                                                                          |
| `yarn test`                | `"npm run test:integration && npm run test:unit"` — `test:unit` is bare `vitest`, i.e. **watch mode**; the command never exits in CI.                                                                                                                                                                                                                                                                                                                     |

**Effective coverage of application code: 0%.** Nothing tests `utils.ts`, `url.ts`, `api.ts`, `proposal.ts`, `config.ts`, `lib/server/`, any store, any component, or any of the register / renew / transfer / vote flows.

### Top issues, ordered by impact

1. **Two different mainnet proposal contract addresses, and the two voter endpoints use different ones.**
   `src/lib/config.ts:28` declares mainnet `02fba7fc0463c34c55a68b05550f24755629cdccd0`; `src/lib/server/config.ts:7` declares mainnet `02bdce8a432de1de5e8d0d413517c2e10ebb0d3e80`. `src/routes/api/proposals/voters/add/+server.ts:11,30,35` uses the **client** constant while `src/routes/api/proposals/voters/remove/+server.ts:14,32,38` uses the **server** one. In production, add-voters and remove-voters write to two different contracts. (Testnet values match, which is why this has never been noticed.) The user-facing vote page `src/routes/proposals/tld-migration/+page.ts:7` also uses the client constant.

2. **The two voter endpoints leak signing state and skip error handling.**
   Both call `metaNamesSdk.setSigningStrategy('privateKey', proposalsWalletPrivateKey)` on the **module-level shared** SDK singleton (`src/lib/server/index.ts:5`), but only reach `resetSigningStrategy()` on the happy path — the early returns at `add/+server.ts:17,27` and `remove/+server.ts:19,29`, and any thrown error, leave the shared server SDK holding the proposals private key for every subsequent request. They are also the only two endpoints that do **not** wrap in `handleError` (`src/lib/server/index.ts:7`), so failures surface as raw 500s. They are unauthenticated `GET`s that sign transactions.

3. **ESLint has been silently dead since the v9 bump; `yarn check` never runs svelte-check.** See table above. Two of the three quality gates in `package.json:13,15` are non-functional, which is how the rest of this list accumulated.

4. **No test coverage anywhere, including on the code with the most recent bug churn.** The last five commits fixed an async race in `DomainSearch` (#95/#115), re-fixed its debouncing (#124), and twice fixed `LoadingButton` error/success state (#108/#114) — all without a single regression test. `src/routes/DomainSearch.svelte:26-31,43-52` (debounce + `requestId` guard) and `src/components/LoadingButton.svelte:305-327` (loading/error/success state machine) are entirely unpinned.

5. **The same transaction boilerplate is copy-pasted 8 times.** `const intent = await …; const { hasError } = await alertTransactionAndFetchResult(intent); if (hasError) throw new Error('Failed to …')` appears at `src/routes/register/[name]/+page.svelte:37`, `src/routes/register/[name]/SubdomainRegistration.svelte:39`, `src/routes/domain/[name]/renew/+page.svelte:23`, `src/routes/domain/[name]/transfer/+page.svelte:40`, `src/components/DomainPayment.svelte:84`, `src/components/Records.svelte:47`, `src/components/Record.svelte:42,49`.

6. **No service layer: 20 direct `$metaNamesSdk.domainRepository.*` / `contractRepository.*` calls scattered across 11 components and loaders.** Register, renew, transfer, subdomain register, search, profile listing and voting each build their own SDK call inline, so none can be tested without a browser and a wallet. `src/routes/domain/[name]/renew/+page.ts` and `src/routes/domain/[name]/transfer/+page.ts` are **byte-identical** 11-line files (`diff` reports no differences).

7. **Unset env vars become the literal string `"undefined"`.** `src/lib/config.ts:23-24` do `` `${import.meta.env.VITE_LANDING_URL}` ``. With the var unset this yields `"undefined"`, which is then rendered as the Footer landing link (`src/routes/Footer.svelte:12`), as the sitemap URL (`src/routes/sitemap.xml/+server.js:16`) and inside `robots.txt` (`src/routes/robots.txt/+server.js:9`). There is **no `.env.example`** in the repo, so the required env contract (`VITE_ENV`, `VITE_LANDING_URL`, `VITE_WEBSITE_URL`, `VITE_CONTRACT_DISABLED`, `PROPOSALS_WALLET_PRIVATE_KEY`) is undocumented.

8. **Store subscriptions inside components are never unsubscribed.** `src/routes/profile/+page.svelte:22` (`walletAddress.subscribe`), `src/routes/domain/[name]/+page.svelte:19` (`refresh.subscribe`), `src/routes/+layout.svelte:41,47`. The `domain/[name]` one is the worst: after navigating away, a `refresh.set(true)` from any `Record` delete still triggers `loadDomain()` for the old domain name and can `goto()` the user to a stale register page.

9. **Profile search never resets when the field is cleared.** `src/routes/profile/+page.svelte:18-20` guards on `search !== ''`, so deleting the text with the keyboard leaves `domainsFiltered` stuck on the last query (only the ✕ button restores it, via `cleanSearch`). `isFuzzyMatch:36-43` also ends with a dead `else false;` and returns `undefined`, and its `startsWith` branch is fully subsumed by `includes`.

10. **Type-safety escapes.** `src/lib/wallet.ts:6` `export type OptionalWalletClient = any`, `src/lib/wallet.ts:16` `config.permissions as any`, `src/routes/WalletConnectButton.svelte:66` `// @ts-ignore` on `setSigningStrategy`, and `src/routes/profile/DomainsTable.svelte:147-149` `[a[sort], b[sort]][sortDirection === 'ascending' ? 'slice' : 'reverse']()` — an unreadable trick for "maybe swap two values".

11. **Dead code and dead dependencies.** `@arisbh/marqueeck` and `@types/siema` have **zero** references anywhere in the repo. `src/routes/api/domains/recent/+server.ts:1` imports `type DomainProjection` unused and `:4` destructures an unused `url`; same unused `url` at `src/routes/api/domains/stats/+server.ts:4`. Two near-duplicate journal directories `.jules/` and `.Jules/` exist (the former breaks `prettier --check`). `.eslintignore` is dead under ESLint 9.

12. **Inconsistent conventions.** Imports split almost evenly between `from 'src/lib/…'` (35 occurrences) and `from '$lib/…'` (37), sometimes both in one file (`src/components/DomainPayment.svelte:2-3` vs `:6,10`). The Sentry DSN is hardcoded and duplicated in `src/hooks.client.ts:5` and `src/hooks.server.ts:6`, both with `tracesSampleRate: 1.0` in production. `'TEST_COIN'` is hardcoded as the subdomain payment token at `src/routes/register/[name]/SubdomainRegistration.svelte:37`. A 20-line GraphQL query is inlined as an escaped string at `src/lib/wallet.ts:27`.

### Scope of this plan

Phases 0–4 below address issues 1–9, 11 and the concrete parts of 10 and 12. Deliberately **out of scope** (YAGNI): rewriting `Domain.svelte`/`+layout.svelte` layouts, Svelte 5 migration, replacing SMUI, adding a state-management library, and touching the SDK itself.

---

## TASKS

Conventions for every task: tabs for indentation, single quotes, no trailing commas, 100-char print width. Run `yarn format` before committing if Prettier complains. **Never** commit with a failing test.

---

### Phase 0 — Repair the tooling (issues 3, 4, 11)

#### Task 0.1 — Stop Prettier choking on the agent journals

**Modify:** `.prettierignore`

Prettier currently fails the whole `lint` script on `.jules/palette.md`, so ESLint never even runs. These are agent journals, not source.

Append to `.prettierignore`:

```
# Agent journals
.jules
.Jules
```

**Verify:**

```bash
npx prettier --plugin prettier-plugin-svelte --check .
```

Expected: `All matched files use Prettier code style!`

**Commit:** `chore(lint): exclude agent journals from prettier`

---

#### Task 0.2 — Migrate ESLint to flat config so it actually runs

**Create:** `eslint.config.js` · **Delete:** `.eslintrc.cjs`, `.eslintignore`

`@eslint/js`, `globals` and `svelte-eslint-parser` are already present in `node_modules` as transitive deps; declare the first two explicitly.

```bash
yarn add -D @eslint/js globals
```

`eslint.config.js`:

```js
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	{
		ignores: [
			'.svelte-kit/',
			'.vercel/',
			'build/',
			'package/',
			'node_modules/',
			'src/styles/theme/',
			'.jules/',
			'.Jules/'
		]
	},
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020,
				extraFileExtensions: ['.svelte']
			},
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: { '@typescript-eslint': tsPlugin },
		rules: { ...tsPlugin.configs.recommended.rules }
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: { parser: tsParser }
		}
	}
];
```

```bash
rm .eslintrc.cjs .eslintignore
```

**Verify:**

```bash
npx eslint .
```

Expected: ESLint **runs** (no `couldn't find an eslint.config` error, no `ESLintIgnoreWarning`). It will report real problems — that is Task 0.3. Record the exact count before continuing.

**Commit:** `chore(lint): migrate to eslint 9 flat config`

---

#### Task 0.3 — Fix everything ESLint now reports

**Modify:** whatever Task 0.2 surfaced. Known candidates:

- `src/routes/api/domains/recent/+server.ts:1` — drop unused `type DomainProjection` from the import.
- `src/routes/api/domains/recent/+server.ts:4` and `src/routes/api/domains/stats/+server.ts:4` — change `export async function GET({ url }) {` to `export async function GET() {`.

Do **not** silence findings with `eslint-disable` unless the rule is genuinely wrong for the case; the existing `// eslint-disable-next-line @typescript-eslint/no-unused-vars` at `src/routes/DomainSearch.svelte:25` is legitimate (the parameter exists to make the reactive statement track `domainName`) — keep it.

**Verify:**

```bash
npx eslint .        # exit 0, no output
yarn run check      # still 3 errors — unchanged by this task
```

**Commit:** `fix(lint): resolve eslint findings`

---

#### Task 0.4 — Make the test scripts CI-safe and unshadow `check`

**Modify:** `package.json`

`test:unit` is bare `vitest` (watch mode — hangs CI), and `yarn check` is shadowed by Yarn 1's built-in command so it silently never runs svelte-check.

Replace the scripts block entries:

```json
		"test": "yarn run test:unit && yarn run test:integration",
		"typecheck": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check": "yarn run typecheck",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"test:integration": "playwright test",
		"test:unit": "vitest run",
		"test:unit:watch": "vitest",
```

**Modify:** `README.md` — add under `## Developing`:

````md
## Quality gates

```bash
yarn lint       # prettier --check + eslint
yarn typecheck  # svelte-check (note: `yarn check` is shadowed by yarn's builtin — use `yarn run check`)
yarn test:unit  # vitest, single run
yarn test       # unit + playwright integration
```
````

````

**Verify:**

```bash
yarn typecheck     # runs svelte-check, reports 3 errors
yarn test:unit     # exits on its own, does not watch
````

**Commit:** `chore(scripts): make test scripts ci-safe and add typecheck alias`

---

#### Task 0.5 — Give Vitest a DOM and component-testing helpers

**Modify:** `vite.config.ts` · **Create:** `src/tests/setup.ts`, `src/components/LoadingButton.test.ts`

```bash
yarn add -D jsdom @testing-library/svelte @testing-library/jest-dom @testing-library/user-event
```

`vite.config.ts` — replace the `test` block and add `resolve`:

```ts
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['src/tests/setup.ts']
	}
```

`src/tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`src/components/LoadingButton.test.ts` — the smoke test that proves the harness works:

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LoadingButton from './LoadingButton.svelte';

describe('LoadingButton', () => {
	it('renders its slot label', () => {
		render(LoadingButton, { props: { onClick: async () => {} } });

		expect(screen.getByRole('button')).toBeInTheDocument();
	});
});
```

**Verify:**

```bash
yarn test:unit
```

Expected: 2 files, 2 tests, all passing.

> **Acceptance risk — read before starting.** SMUI 7 components instantiate MDC ripple/foundation code on mount. If this test fails with a `svelte/internal` resolution error, add `'@testing-library/svelte'` to `optimizeDeps.exclude`; if it fails inside MDC (`getComputedStyle`, `matchMedia`), add the standard `window.matchMedia` stub to `src/tests/setup.ts`. If SMUI still cannot mount under jsdom after those two fixes, **stop and report** — do not fight it. Fall back to: keep the jsdom harness (Tasks 2.x and 4.x still need it for non-SMUI modules), and move Tasks 1.6 to Playwright instead.

**Commit:** `test: add jsdom + testing-library harness for component tests`

---

#### Task 0.6 — Replace the Playwright boilerplate spec with a real smoke test

**Modify:** `tests/test.ts`

`tests/test.ts:4` asserts an `h1` reading `Welcome to SvelteKit`; the home page renders `<h3>Find your Meta Name</h3>` (`src/routes/+page.svelte:11`). The spec has never run.

```bash
npx playwright install --with-deps chromium
```

Replace `tests/test.ts` entirely:

```ts
import { expect, test } from '@playwright/test';

test('home page shows the domain search', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: 'Find your Meta Name' })).toBeVisible();
	await expect(page.getByLabel('Domain name')).toBeVisible();
});

test('profile page asks a disconnected visitor to connect', async ({ page }) => {
	await page.goto('/profile');

	await expect(page.getByText('Connect your wallet to see your domains')).toBeVisible();
});

test('unknown routes render the not-found page', async ({ page }) => {
	await page.goto('/this-route-does-not-exist');

	await expect(page.getByRole('heading', { name: 'Not found!' })).toBeVisible();
});
```

**Verify:**

```bash
yarn test:integration
```

Expected: 3 passed. (The build step runs first — it takes a few minutes.)

**Commit:** `test(e2e): replace boilerplate spec with real smoke tests`

---

### Phase 1 — Characterization tests for untested logic (issue 4)

Every test in this phase asserts **current** behaviour, including behaviour that looks wrong. Bugs get fixed in Phase 4, with the test updated in the same commit so the change is visible in the diff.

#### Task 1.1 — Characterize `src/lib/utils.ts` formatters and validators

**Create:** `src/lib/utils.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
	formatDate,
	formatDateToRelativeDate,
	isValidURL,
	removeHTTPIfPresent,
	validAddress
} from './utils';

describe('formatDate', () => {
	it('formats a Date as "D Month, YYYY"', () => {
		expect(formatDate(new Date(2024, 4, 22))).toBe('22 May, 2024');
	});

	it('accepts an ISO string', () => {
		expect(formatDate('2024-05-22T10:00:00.000Z')).toContain('2024');
	});
});

describe('isValidURL', () => {
	it.each([
		['https://metanames.app', true],
		['not a url', false],
		['', false]
	])('%s -> %s', (url, expected) => {
		expect(isValidURL(url)).toBe(expected);
	});
});

describe('validAddress', () => {
	const valid = '0'.repeat(42);

	it('accepts 42 alphanumeric characters', () => {
		expect(validAddress(valid)).toBe(true);
	});

	it('rejects the wrong length', () => {
		expect(validAddress('0'.repeat(41))).toBe(false);
	});

	it('rejects non-alphanumeric characters', () => {
		expect(validAddress('-'.repeat(42))).toBe(false);
	});
});

describe('removeHTTPIfPresent', () => {
	it.each([
		['https://metanames.app', 'metanames.app'],
		['http://metanames.app', 'metanames.app'],
		['metanames.app', 'metanames.app']
	])('%s -> %s', (url, expected) => {
		expect(removeHTTPIfPresent(url)).toBe(expected);
	});
});

describe('formatDateToRelativeDate', () => {
	it('renders a suffixed relative distance', () => {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		expect(formatDateToRelativeDate(oneHourAgo)).toBe('about 1 hour ago');
	});
});
```

**Verify:** `yarn test:unit` → all pass. If `formatDate` disagrees on the ISO-string case because of the local timezone, keep the loose `toContain` assertion rather than pinning a timezone-dependent value.

**Commit:** `test(lib): characterize utils formatters and validators`

---

#### Task 1.2 — Characterize `src/lib/url.ts`

**Create:** `src/lib/url.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
	backendBrowserUrl,
	bridgeUrl,
	explorerAddressUrl,
	explorerTransactionUrl,
	shortLinkUrl
} from './url';

describe('explorerTransactionUrl', () => {
	it('points at the transaction on the configured browser', () => {
		expect(explorerTransactionUrl('abc123')).toContain('/transactions/abc123');
	});
});

describe('explorerAddressUrl', () => {
	it('routes a 00-prefixed address to accounts', () => {
		expect(explorerAddressUrl(`00${'a'.repeat(40)}`)).toContain(
			`/accounts/00${'a'.repeat(40)}/assets`
		);
	});

	it('routes any other address to contracts', () => {
		expect(explorerAddressUrl(`02${'a'.repeat(40)}`)).toContain(`/contracts/02${'a'.repeat(40)}`);
	});
});

describe('static urls', () => {
	it('exposes the bridge under the browser url', () => {
		expect(bridgeUrl).toMatch(/\/bridge$/);
	});

	it('points the graphql backend at the browser backend', () => {
		expect(backendBrowserUrl).toMatch(/\/graphql\/query$/);
	});

	it('builds the metanam.es short link', () => {
		expect(shortLinkUrl('alice')).toBe('https://metanam.es/alice');
	});
});
```

**Verify:** `yarn test:unit` → all pass.

**Commit:** `test(lib): characterize explorer and short-link urls`

---

#### Task 1.3 — Characterize `fetchApiJson`

**Create:** `src/lib/api.test.ts`

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchApiJson } from './api';

vi.mock('@sentry/sveltekit', () => ({ captureException: vi.fn() }));

describe('fetchApiJson', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns the parsed body on success', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, json: async () => ({ name: 'alice.meta' }) })
		);

		await expect(fetchApiJson<{ name: string }>('/api/x')).resolves.toEqual({ name: 'alice.meta' });
	});

	it('surfaces the server error message on a non-ok response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Invalid coin' }) })
		);

		await expect(fetchApiJson('/api/x')).resolves.toEqual({ error: 'Invalid coin' });
	});

	it('falls back to a generic message when the body has no error field', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

		await expect(fetchApiJson('/api/x')).resolves.toEqual({ error: 'Something went wrong' });
	});

	it('returns a generic error when the request throws', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

		await expect(fetchApiJson('/api/x')).resolves.toEqual({ error: 'Something went wrong' });
	});
});
```

**Verify:** `yarn test:unit` → 4 new tests pass.

**Commit:** `test(lib): characterize fetchApiJson error paths`

---

#### Task 1.4 — Characterize `alertTransactionAndFetchResult`

**Create:** `src/lib/transaction-alert.test.ts`

This is the shared tail of every write flow (`src/lib/utils.ts:16-32`); pin it before Task 3.2 builds on it.

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { alertTransactionAndFetchResult } from './utils';
import { alertMessage, alertTransaction } from './stores/main';

vi.mock('@sentry/sveltekit', () => ({ captureException: vi.fn() }));

describe('alertTransactionAndFetchResult', () => {
	beforeEach(() => {
		alertMessage.set(undefined);
		alertTransaction.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('announces the transaction hash and returns the result', async () => {
		const result = { transactionHash: 'hash-1', hasError: false, eventTrace: [] };
		const intent = { transactionHash: 'hash-1', fetchResult: Promise.resolve(result) };

		await expect(alertTransactionAndFetchResult(intent as never)).resolves.toEqual(result);
		expect(get(alertTransaction)).toBe('hash-1');
	});

	it('converts a rejected fetchResult into an errored result and alerts the user', async () => {
		const intent = {
			transactionHash: 'hash-2',
			fetchResult: Promise.reject(new Error('chain rejected'))
		};

		await expect(alertTransactionAndFetchResult(intent as never)).resolves.toEqual({
			transactionHash: 'hash-2',
			hasError: true,
			errorMessage: 'chain rejected',
			eventTrace: []
		});
		expect(get(alertMessage)).toBe('chain rejected');
	});
});
```

**Verify:** `yarn test:unit` → 2 new tests pass.

**Commit:** `test(lib): characterize transaction alert helper`

---

#### Task 1.5 — Characterize `src/lib/proposal.ts` state readers

**Create:** `src/lib/proposal.test.ts`

`getDeadline` / `getVotesResult` decode raw contract state; they only need a shaped stub, not the real ABI client.

```ts
import { describe, it, expect } from 'vitest';
import type { ScValueStruct } from '@partisiablockchain/abi-client';
import { getDeadline, getVotesResult } from './proposal';

const stateWith = (fields: Record<string, unknown>) =>
	({ fieldsMap: new Map(Object.entries(fields)) }) as unknown as ScValueStruct;

describe('getDeadline', () => {
	it('reads deadline_utc_millis', () => {
		const state = stateWith({
			deadline_utc_millis: { asBN: () => ({ toNumber: () => 1_700_000_000_000 }) }
		});

		expect(getDeadline(state)).toBe(1_700_000_000_000);
	});

	it('throws when the field is missing', () => {
		expect(() => getDeadline(stateWith({}))).toThrow('Deadline not found in contract state');
	});
});

describe('getVotesResult', () => {
	it('tallies approvals and rejections', () => {
		const votes = [true, false, true].map((approved) => ({ boolValue: () => approved }));
		const state = stateWith({ votes: { avlTreeMapValue: () => ({ map: votes }) } });

		expect(getVotesResult(state)).toEqual({ approved: 2, rejected: 1 });
	});

	it('throws when votes are missing', () => {
		expect(() => getVotesResult(stateWith({}))).toThrow('Results not found in contract state');
	});
});
```

**Verify:** `yarn test:unit` → 4 new tests pass. If `votesMap.forEach` needs a real `Map`, wrap the array in `new Map(votes.map((v, i) => [i, v]))`.

**Commit:** `test(lib): characterize proposal state readers`

---

#### Task 1.6 — Characterize the `LoadingButton` state machine

**Modify:** `src/components/LoadingButton.test.ts`

This component was patched twice in the last five commits (#108, #114). Pin all four states.

Add to the existing describe block:

```ts
it('shows the loading indicator while the click handler is pending', async () => {
	let release: () => void = () => {};
	const onClick = () => new Promise<void>((resolve) => (release = resolve));

	render(LoadingButton, { props: { onClick } });
	await fireEvent.click(screen.getByRole('button'));

	expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

	release();
});

it('calls onError and marks the button as errored when the handler rejects', async () => {
	const onError = vi.fn(async () => {});
	const onClick = async () => {
		throw new Error('boom');
	};

	render(LoadingButton, { props: { onClick, onError } });
	await fireEvent.click(screen.getByRole('button'));
	await waitFor(() => expect(onError).toHaveBeenCalledOnce());
});

it('clears the previous error state on a retry', async () => {
	const onError = vi.fn(async () => {});
	let shouldFail = true;
	const onClick = async () => {
		if (shouldFail) throw new Error('boom');
	};

	render(LoadingButton, { props: { onClick, onError } });
	await fireEvent.click(screen.getByRole('button'));
	await waitFor(() => expect(onError).toHaveBeenCalledOnce());

	shouldFail = false;
	await fireEvent.click(screen.getByRole('button'));
	await waitFor(() => expect(screen.queryByLabelText('Error')).not.toBeInTheDocument());
});

it('ignores clicks while already loading', async () => {
	const onClick = vi.fn(() => new Promise<void>(() => {}));

	render(LoadingButton, { props: { onClick } });
	const button = screen.getByRole('button');
	await fireEvent.click(button);
	await fireEvent.click(button);

	expect(onClick).toHaveBeenCalledOnce();
});
```

Extend the imports at the top of the file:

```ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
```

**Verify:** `yarn test:unit` → 5 `LoadingButton` tests pass. If jsdom cannot mount SMUI (see the risk note in Task 0.5), move these assertions into `tests/loading-button.spec.ts` as Playwright tests against the transfer page's submit button instead.

**Commit:** `test(components): characterize LoadingButton state machine`

---

### Phase 2 — Fix the config split and the typecheck errors (issues 1, 7, and svelte-check)

#### Task 2.1 — Pin the current proposal-address behaviour, then unify it

**Create:** `src/lib/contracts.test.ts`, `src/lib/contracts.ts` · **Modify:** `src/lib/config.ts`, `src/lib/server/config.ts`

> ⚠️ **Confirm with the team before implementing.** `src/lib/config.ts:28` and `src/lib/server/config.ts:7` declare _different_ mainnet addresses. This plan unifies on the **client** value `02fba7fc0463c34c55a68b05550f24755629cdccd0`, because it is the one the user-facing vote page (`src/routes/proposals/tld-migration/+page.ts:7`) and the add-voters endpoint already use. If the team says the server value is the live contract, use that instead and adjust the test — but do **not** ship two.

Write the test first:

```ts
import { describe, it, expect } from 'vitest';
import { tldMigrationProposalContractAddress } from './contracts';
import { config } from './config';
import { tldMigrationProposalContractAddress as serverAddress } from './server/config';

describe('tldMigrationProposalContractAddress', () => {
	it('is a single source of truth shared by client and server config', () => {
		expect(config.tldMigrationProposalContractAddress).toBe(tldMigrationProposalContractAddress);
		expect(serverAddress).toBe(tldMigrationProposalContractAddress);
	});

	it('resolves to the testnet contract outside production', () => {
		expect(tldMigrationProposalContractAddress).toBe('021e68773e9bd5fc28381802c4b24899499f039ea9');
	});
});
```

Run `yarn test:unit` → **fails** (`./contracts` does not exist). Then create `src/lib/contracts.ts`:

```ts
const tldMigrationProposal = {
	mainnet: '02fba7fc0463c34c55a68b05550f24755629cdccd0',
	testnet: '021e68773e9bd5fc28381802c4b24899499f039ea9'
};

export const tldMigrationProposalContractAddressFor = (environment: 'test' | 'prod') =>
	environment === 'prod' ? tldMigrationProposal.mainnet : tldMigrationProposal.testnet;
```

In `src/lib/config.ts`, delete lines 27-32 and import instead:

```ts
import { tldMigrationProposalContractAddressFor } from './contracts';
```

```ts
const tldMigrationProposalContractAddress = tldMigrationProposalContractAddressFor(environment);
```

Add the re-export at the end of `src/lib/contracts.ts` is not needed; instead the test's `./contracts` import resolves via a named constant — add it there:

```ts
import { config } from './config';

export const tldMigrationProposalContractAddress = config.tldMigrationProposalContractAddress;
```

> Circular-import guard: put `tldMigrationProposalContractAddressFor` in `src/lib/contracts.ts` and the resolved `tldMigrationProposalContractAddress` constant in `src/lib/config.ts` only. If the test's import of `./contracts` creates a cycle, import `config.tldMigrationProposalContractAddress` in the test directly and drop the re-export.

In `src/lib/server/config.ts`, delete lines 6-11 and re-export the shared value:

```ts
import { config } from '../config';
import { PROPOSALS_WALLET_PRIVATE_KEY } from '$env/static/private';

export const proposalsWalletPrivateKey = `${PROPOSALS_WALLET_PRIVATE_KEY}`;
export const tldMigrationProposalContractAddress = config.tldMigrationProposalContractAddress;
```

**Verify:** `yarn test:unit` → passes. `npx eslint .` → clean.

**Commit:** `fix(config): unify the tld migration proposal contract address`

---

#### Task 2.2 — Point the add-voters endpoint at the server config

**Modify:** `src/routes/api/proposals/voters/add/+server.ts`

Now that both configs resolve to the same address, make the two endpoints symmetric so they cannot drift again. Replace lines 3-5:

```ts
import {
	proposalsWalletPrivateKey,
	tldMigrationProposalContractAddress
} from 'src/lib/server/config';
import { actionAddVotersPayload } from 'src/lib/proposal';
```

and replace the three `config.tldMigrationProposalContractAddress` occurrences (`:11`, `:30`, `:35`) with `tldMigrationProposalContractAddress`. Delete the now-unused `import { config } from 'src/lib';`.

**Verify:**

```bash
diff <(sed 's/Add/Remove/g;s/add/remove/g;s/newVoters/votersToRemove/g' src/routes/api/proposals/voters/add/+server.ts) src/routes/api/proposals/voters/remove/+server.ts
```

The two files should now differ only in the filter direction and response key — which is exactly what Task 3.5 collapses. Then `yarn typecheck` and `npx eslint .`.

**Commit:** `fix(api): use the server proposal contract address for add-voters`

---

#### Task 2.3 — Stop unset env vars becoming the string `"undefined"`

**Create:** `src/lib/env.test.ts`, `src/lib/env.ts` · **Modify:** `src/lib/config.ts`

Failing test first:

```ts
import { describe, it, expect } from 'vitest';
import { optionalEnv } from './env';

describe('optionalEnv', () => {
	it('returns the value when set', () => {
		expect(optionalEnv('https://metanames.app', '')).toBe('https://metanames.app');
	});

	it('falls back when the value is undefined', () => {
		expect(optionalEnv(undefined, 'https://metanames.app')).toBe('https://metanames.app');
	});

	it('falls back when the value is the literal string "undefined"', () => {
		expect(optionalEnv('undefined', 'https://metanames.app')).toBe('https://metanames.app');
	});

	it('falls back on an empty value', () => {
		expect(optionalEnv('', 'https://metanames.app')).toBe('https://metanames.app');
	});
});
```

Run → fails. Then `src/lib/env.ts`:

```ts
export const optionalEnv = (value: string | undefined, fallback: string) => {
	if (value === undefined || value === '' || value === 'undefined') return fallback;

	return value;
};
```

In `src/lib/config.ts`, replace lines 23-24:

```ts
const landingUrl = optionalEnv(import.meta.env.VITE_LANDING_URL, 'https://metanames.app');
const websiteUrl = optionalEnv(import.meta.env.VITE_WEBSITE_URL, 'https://app.metanames.app/');
```

and add `import { optionalEnv } from './env';` at the top.

> Keep the trailing slash on `websiteUrl` — `src/routes/robots.txt/+server.js:9` and `src/routes/sitemap.xml/+server.js:16` concatenate directly onto it.

**Verify:** `yarn test:unit` → passes. `yarn dev` and load `/robots.txt`: the `Sitemap:` line must be a real URL, not `undefinedsitemap.xml`.

**Commit:** `fix(config): fall back instead of rendering "undefined" for unset env vars`

---

#### Task 2.4 — Document the env contract

**Create:** `.env.example` · **Modify:** `.gitignore` (verify only — it already has `!.env.example`)

```
# Deployment environment: "test" (default) or "prod"
VITE_ENV=test

# Public marketing site linked from the footer
VITE_LANDING_URL=https://metanames.app

# Canonical app URL used in robots.txt and sitemap.xml (keep the trailing slash)
VITE_WEBSITE_URL=https://app.metanames.app/

# Set to "true" to show the "contract temporarily disabled" banner
VITE_CONTRACT_DISABLED=false

# Server-only: hex private key used to sign proposal voter add/remove transactions
PROPOSALS_WALLET_PRIVATE_KEY=
```

**Verify:** `git check-ignore -v .env.example` → no match (the file is tracked).

**Commit:** `docs: document the required environment variables`

---

#### Task 2.5 — Resolve svelte-check error 1 (`$env/static/private`)

**Modify:** `src/lib/server/config.ts`

`$env/static/private` typing requires the variable to exist at `svelte-kit sync` time, which breaks any checkout without a `.env`. A secret read at runtime belongs in `$env/dynamic/private`.

```ts
import { config } from '../config';
import { env } from '$env/dynamic/private';

export const proposalsWalletPrivateKey = `${env.PROPOSALS_WALLET_PRIVATE_KEY ?? ''}`;
export const tldMigrationProposalContractAddress = config.tldMigrationProposalContractAddress;
```

**Verify:** `yarn typecheck` → the `PROPOSALS_WALLET_PRIVATE_KEY` error is gone; **2 errors** remain.

**Commit:** `fix(server): read the proposals private key from dynamic env`

---

#### Task 2.6 — Resolve svelte-check error 2 (`onError` variance)

**Modify:** `src/components/DomainPayment.svelte`

`LoadingButton` declares `onError: (error: unknown) => Promise<void>` (`src/components/LoadingButton.svelte:283`); `handleApproveError` narrows the parameter to `Error` (`:54`), which is unsound and rejected under strict function types.

Replace lines 54-68:

```ts
async function handleApproveError(error: unknown) {
	let message;
	if (error instanceof InsufficientBalanceError)
		message = {
			message: `Insufficient balance for ${error.coin}`,
			action: {
				label: 'Add funds',
				callback: () => window.open(bridgeUrl, '_blank')
			}
		};
	else if (error instanceof Error) message = error.message;
	else message = 'Something went wrong';

	alertMessage.set(message);
}
```

**Verify:** `yarn typecheck` → **1 error** remains. `yarn test:unit` → still green.

**Commit:** `fix(payment): widen the approve error handler to unknown`

---

#### Task 2.7 — Resolve svelte-check error 3 (SMUI ambient const enum)

**Modify:** `tsconfig.json`

`@smui/banner` re-exports ambient const enums from `@material/banner`, which `verbatimModuleSyntax` (inherited from `.svelte-kit/tsconfig.json`) forbids. Opt out explicitly:

```json
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"verbatimModuleSyntax": false
	}
```

**Verify:**

```bash
yarn typecheck
```

Expected: `svelte-check found 0 errors and 0 warnings`. **This is the milestone — a clean typecheck for the first time.** If disabling `verbatimModuleSyntax` surfaces new import-elision errors elsewhere, revert this and instead add `"ignoreDeprecations"`-free scoping by excluding `node_modules/@smui/**` from the check; report which route you took.

**Commit:** `fix(ts): disable verbatimModuleSyntax to unblock smui const enums`

---

### Phase 3 — Remove duplication (issues 2, 5, 6)

#### Task 3.1 — Collapse the two identical page loaders

**Create:** `src/lib/loaders.ts`, `src/lib/loaders.test.ts` · **Modify:** `src/routes/domain/[name]/renew/+page.ts`, `src/routes/domain/[name]/transfer/+page.ts`

These two files are byte-identical (`diff` reports nothing).

Failing test first, `src/lib/loaders.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { analyzeDomain } from './loaders';

vi.mock('./sdk', () => ({
	metaNamesSdkFactory: () => ({
		domainRepository: {
			analyze: (name: string) => {
				if (name === 'bad name') throw new Error('Invalid domain name');
				return { name, tld: 'meta', parentId: undefined };
			}
		}
	})
}));

describe('analyzeDomain', () => {
	it('returns the analyzed domain', () => {
		expect(analyzeDomain('alice')).toEqual({
			analyzed: { name: 'alice', tld: 'meta', parentId: undefined }
		});
	});

	it('returns the error message when analysis throws', () => {
		expect(analyzeDomain('bad name')).toEqual({ error: 'Invalid domain name' });
	});
});
```

Run → fails. Then `src/lib/loaders.ts`:

```ts
import { metaNamesSdkFactory } from './sdk';

export function analyzeDomain(name: string) {
	try {
		const analyzed = metaNamesSdkFactory().domainRepository.analyze(name);
		return { analyzed };
	} catch (e) {
		if (e instanceof Error) return { error: e.message };
		else return { error: 'Something went wrong' };
	}
}
```

Both `+page.ts` files become:

```ts
import { analyzeDomain } from '$lib/loaders';

export function load({ params: { name } }) {
	return analyzeDomain(name);
}
```

**Verify:** `yarn test:unit`, `yarn typecheck` (0 errors), `yarn test:integration`.

**Commit:** `refactor(routes): share the domain analysis page loader`

---

#### Task 3.2 — Introduce `runTransaction` and prove it matches the copy-pasted block

**Create:** `src/lib/transaction.ts`, `src/lib/transaction.test.ts`

Failing test first:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runTransaction } from './transaction';
import { alertMessage, alertTransaction } from './stores/main';

vi.mock('@sentry/sveltekit', () => ({ captureException: vi.fn() }));

describe('runTransaction', () => {
	beforeEach(() => {
		alertMessage.set(undefined);
		alertTransaction.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('resolves with the result when the transaction succeeds', async () => {
		const result = { transactionHash: 'hash-1', hasError: false, eventTrace: [] };
		const intent = { transactionHash: 'hash-1', fetchResult: Promise.resolve(result) };

		await expect(runTransaction(intent as never, 'Failed to register domain.')).resolves.toEqual(
			result
		);
	});

	it('throws the supplied failure message when the transaction errors', async () => {
		const result = { transactionHash: 'hash-2', hasError: true, eventTrace: [] };
		const intent = { transactionHash: 'hash-2', fetchResult: Promise.resolve(result) };

		await expect(runTransaction(intent as never, 'Failed to register domain.')).rejects.toThrow(
			'Failed to register domain.'
		);
	});
});
```

Run → fails. Then `src/lib/transaction.ts`:

```ts
import type { ITransactionIntent, ITransactionResult } from '@metanames/sdk';
import { alertTransactionAndFetchResult } from './utils';

export async function runTransaction(
	intent: ITransactionIntent,
	failureMessage: string
): Promise<ITransactionResult> {
	const result = await alertTransactionAndFetchResult(intent);
	if (result.hasError) throw new Error(failureMessage);

	return result;
}
```

**Verify:** `yarn test:unit` → 2 new tests pass. No call site changes yet.

**Commit:** `feat(lib): add runTransaction helper`

---

#### Task 3.3 — Adopt `runTransaction` in the write flows that throw

**Modify:** `src/routes/register/[name]/+page.svelte`, `src/routes/register/[name]/SubdomainRegistration.svelte`, `src/routes/domain/[name]/renew/+page.svelte`, `src/components/DomainPayment.svelte`, `src/components/Records.svelte`

Five call sites use the identical throw-on-error shape. Replace each pair of lines with a single call. Example, `src/routes/register/[name]/+page.svelte:37-38`:

```ts
await runTransaction(transactionIntent, 'Failed to register domain.');
alertMessage.set({
	message: 'Domain registered successfully!',
	action: { label: 'Go to profile', callback: () => goto('/profile') }
});
```

Apply the same shape at:

| File                                                      | Line  | Failure message                                                    |
| --------------------------------------------------------- | ----- | ------------------------------------------------------------------ |
| `src/routes/register/[name]/SubdomainRegistration.svelte` | 39-42 | `'Failed to register domain.'`                                     |
| `src/routes/domain/[name]/renew/+page.svelte`             | 23-25 | `'Failed to renew domain.'`                                        |
| `src/components/DomainPayment.svelte`                     | 84-86 | `'Failed to approve mint fees.'` (then `feesApproved = true;`)     |
| `src/components/Records.svelte`                           | 47-54 | `'Failed to create record.'` (keep the reset block after the call) |

Swap `alertTransactionAndFetchResult` for `runTransaction` in each import.

> `src/components/Record.svelte:42,49` and `src/routes/domain/[name]/transfer/+page.svelte:40` use a _different_ shape (they `alertMessage.set(...)` or branch on `!hasError` instead of throwing). **Leave them alone** — they are not the same behaviour, and forcing them into `runTransaction` would change what the user sees.

**Verify:** `yarn test:unit`, `yarn typecheck` (0 errors), `npx eslint .`, `yarn test:integration`. Then manually smoke one flow on testnet if a wallet is available.

**Commit:** `refactor(flows): use runTransaction for throw-on-error write flows`

---

#### Task 3.4 — Extract the domain write flows into a service

**Create:** `src/lib/services/domain.ts`, `src/lib/services/domain.test.ts` · **Modify:** `src/routes/register/[name]/+page.svelte`, `src/routes/domain/[name]/renew/+page.svelte`, `src/routes/domain/[name]/transfer/+page.svelte`

Failing test first (mock the SDK store, assert the SDK is called with exactly the arguments the components pass today):

```ts
import { describe, it, expect, vi } from 'vitest';
import { registerDomain, renewDomain, transferDomain } from './domain';

const register = vi.fn(async () => ({
	transactionHash: 'h',
	fetchResult: Promise.resolve({ hasError: false })
}));
const renew = vi.fn(async () => ({
	transactionHash: 'h',
	fetchResult: Promise.resolve({ hasError: false })
}));
const transfer = vi.fn(async () => ({
	transactionHash: 'h',
	fetchResult: Promise.resolve({ hasError: false })
}));

vi.mock('../stores/sdk', () => ({
	metaNamesSdk: {
		subscribe: (run: (v: unknown) => void) => (
			run({ domainRepository: { register, renew, transfer } }),
			() => {}
		)
	}
}));
vi.mock('@sentry/sveltekit', () => ({ captureException: vi.fn() }));

describe('domain service', () => {
	it('registers with the sdk argument shape the register page uses', async () => {
		await registerDomain({
			domainName: 'alice.meta',
			address: 'addr',
			byocSymbol: 'ETH',
			years: 2
		});

		expect(register).toHaveBeenCalledWith({
			domain: 'alice.meta',
			to: 'addr',
			subscriptionYears: 2,
			byocSymbol: 'ETH'
		});
	});

	it('renews with the sdk argument shape the renew page uses', async () => {
		await renewDomain({ domainName: 'alice.meta', address: 'addr', byocSymbol: 'ETH', years: 1 });

		expect(renew).toHaveBeenCalledWith({
			domain: 'alice.meta',
			payer: 'addr',
			byocSymbol: 'ETH',
			subscriptionYears: 1
		});
	});

	it('transfers with the sdk argument shape the transfer page uses', async () => {
		await transferDomain({ domainName: 'alice.meta', from: 'a', to: 'b' });

		expect(transfer).toHaveBeenCalledWith({ domain: 'alice.meta', from: 'a', to: 'b' });
	});
});
```

Run → fails. Then `src/lib/services/domain.ts`:

```ts
import { get } from 'svelte/store';
import { metaNamesSdk } from '../stores/sdk';
import { runTransaction } from '../transaction';
import type { DomainPaymentParams } from '../types';

export async function registerDomain(params: DomainPaymentParams) {
	const intent = await get(metaNamesSdk).domainRepository.register({
		domain: params.domainName,
		to: params.address,
		subscriptionYears: params.years,
		byocSymbol: params.byocSymbol
	});

	return runTransaction(intent, 'Failed to register domain.');
}

export async function renewDomain(params: DomainPaymentParams) {
	const intent = await get(metaNamesSdk).domainRepository.renew({
		domain: params.domainName,
		payer: params.address,
		byocSymbol: params.byocSymbol,
		subscriptionYears: params.years
	});

	return runTransaction(intent, 'Failed to renew domain.');
}

export async function transferDomain(params: { domainName: string; from: string; to: string }) {
	const intent = await get(metaNamesSdk).domainRepository.transfer({
		domain: params.domainName,
		from: params.from,
		to: params.to
	});

	return alertTransactionAndFetchResult(intent);
}
```

Add `import { alertTransactionAndFetchResult } from '../utils';`. **`transferDomain` deliberately does not throw** — `src/routes/domain/[name]/transfer/+page.svelte:41` branches on `!hasError` and shows no error alert; preserve that.

Then thin the three components down to `await registerDomain(params)` / `await renewDomain(params)` / `const { hasError } = await transferDomain({ domainName, from: $walletAddress, to: address })`, keeping their existing `track(...)`, `alertMessage.set(...)` and `goto(...)` calls exactly where they are.

**Verify:** `yarn test:unit`, `yarn typecheck` (0 errors), `npx eslint .`, `yarn test:integration`.

**Commit:** `refactor(services): extract domain register/renew/transfer into a service`

---

#### Task 3.5 — Collapse the duplicated voter endpoints and stop the signing-key leak

**Create:** `src/lib/server/voters.ts`, `src/lib/server/voters.test.ts` · **Modify:** `src/routes/api/proposals/voters/add/+server.ts`, `src/routes/api/proposals/voters/remove/+server.ts`

Two 43/45-line files that differ only in filter direction and payload builder — and both leave the shared server SDK holding the proposals private key whenever they return early or throw.

Failing test first for the pure part:

```ts
import { describe, it, expect } from 'vitest';
import { votersToAdd, votersToRemove } from './voters';

describe('voter diffing', () => {
	const owners = ['a', 'b', 'c'];
	const voters = ['b', 'z'];

	it('adds owners that are not yet voters', () => {
		expect(votersToAdd(owners, voters)).toEqual(['a', 'c']);
	});

	it('removes voters that are no longer owners', () => {
		expect(votersToRemove(owners, voters)).toEqual(['z']);
	});

	it('caps each batch at 50 addresses', () => {
		const many = Array.from({ length: 60 }, (_, i) => `owner-${i}`);

		expect(votersToAdd(many, [])).toHaveLength(50);
	});
});
```

Run → fails. Then `src/lib/server/voters.ts`:

```ts
const BATCH_SIZE = 50;

export const votersToAdd = (owners: string[], voters: string[]) =>
	owners.filter((owner) => !voters.includes(owner)).slice(0, BATCH_SIZE);

export const votersToRemove = (owners: string[], voters: string[]) =>
	voters.filter((voter) => !owners.includes(voter)).slice(0, BATCH_SIZE);
```

Then rewrite each endpoint to (a) wrap in `handleError` like every other endpoint, and (b) reset the signing strategy in a `finally`:

```ts
import { handleError, metaNamesSdk } from '$lib/server';
import { votersToAdd } from '$lib/server/voters';
import { json } from '@sveltejs/kit';
import {
	proposalsWalletPrivateKey,
	tldMigrationProposalContractAddress
} from 'src/lib/server/config';
import { actionAddVotersPayload } from 'src/lib/proposal';

export async function GET() {
	return handleError(async () => {
		metaNamesSdk.setSigningStrategy('privateKey', proposalsWalletPrivateKey);

		try {
			const votingContractState = await metaNamesSdk.contractRepository.getState({
				contractAddress: tldMigrationProposalContractAddress
			});
			const fields = votingContractState.fieldsMap;

			const deadline = fields.get('deadline_utc_millis')?.asBN().toNumber();
			if (deadline && deadline < Date.now())
				return json({ error: 'Voting has ended' }, { status: 400 });

			const owners = await metaNamesSdk.domainRepository.getOwners();
			const voters =
				fields
					.get('voters')
					?.setValue()
					.values.map((voter) => voter.addressValue().value.toString('hex')) ?? [];

			const newVoters = votersToAdd(owners, voters);
			if (newVoters.length === 0) return json({ newVoters }, { status: 200 });

			const votingContract = await metaNamesSdk.contractRepository.getContract({
				contractAddress: tldMigrationProposalContractAddress
			});
			const payload = actionAddVotersPayload(votingContract.abi, newVoters);

			const { transactionHash } = await metaNamesSdk.contractRepository.createTransaction({
				contractAddress: tldMigrationProposalContractAddress,
				payload,
				gasCost: 'low'
			});

			return json({ newVoters, transactionHash });
		} finally {
			metaNamesSdk.resetSigningStrategy();
		}
	});
}
```

Mirror it in `remove/+server.ts` with `votersToRemove`, `actionRemoveVotersPayload`, and the existing `newVoters: votersToRemove` response key (**keep that key name** — changing it would break any caller).

**Verify:** `yarn test:unit`, `yarn typecheck` (0 errors), `npx eslint .`.

> **Flag for the team, do not fix here:** both endpoints are unauthenticated `GET`s that sign on-chain transactions with a wallet private key. Adding auth is a behaviour change outside this plan's "features must keep working" contract — raise it separately.

**Commit:** `refactor(api): share voter diffing and always reset the signing strategy`

---

### Phase 4 — Fix the bugs the tests now make safe to touch (issues 8, 9)

#### Task 4.1 — Pin, then fix, the profile domain filter

**Create:** `src/lib/filter.test.ts`, `src/lib/filter.ts` · **Modify:** `src/routes/profile/+page.svelte`

Write the test for the _desired_ behaviour (this task fixes a bug, so the test documents the change):

```ts
import { describe, it, expect } from 'vitest';
import { filterDomainsByName } from './filter';

const domains = [{ name: 'alice.meta' }, { name: 'bob.meta' }, { name: 'ALICIA.meta' }];

describe('filterDomainsByName', () => {
	it('returns every domain for an empty search', () => {
		expect(filterDomainsByName(domains, '')).toEqual(domains);
	});

	it('returns every domain for a whitespace-only search', () => {
		expect(filterDomainsByName(domains, '   ')).toEqual(domains);
	});

	it('matches case-insensitively on a substring', () => {
		expect(filterDomainsByName(domains, 'ali')).toEqual([
			{ name: 'alice.meta' },
			{ name: 'ALICIA.meta' }
		]);
	});

	it('returns nothing when nothing matches', () => {
		expect(filterDomainsByName(domains, 'zzz')).toEqual([]);
	});
});
```

Run → fails. Then `src/lib/filter.ts`:

```ts
export const filterDomainsByName = <T extends { name: string }>(domains: T[], search: string) => {
	const query = search.trim().toLowerCase();
	if (query === '') return domains;

	return domains.filter((domain) => domain.name.trim().toLowerCase().includes(query));
};
```

In `src/routes/profile/+page.svelte`, delete `isFuzzyMatch` (lines 36-43, which ends in a dead `else false;` and returns `undefined`) and replace the guarded reactive block at lines 18-20:

```ts
$: domainsFiltered = filterDomainsByName(domains, search);
```

`cleanSearch` (lines 31-34) becomes just `search = '';` — the reactive statement now restores the full list on its own.

**Verify:** `yarn test:unit`, `yarn typecheck`, `npx eslint .`. Manually: type into the profile search, then delete the text with backspace — the full list must come back (it previously stayed filtered).

**Commit:** `fix(profile): restore the full domain list when the search is cleared`

---

#### Task 4.2 — Stop the `refresh` subscription outliving the domain page

**Modify:** `src/routes/domain/[name]/+page.svelte`

`refresh.subscribe` at line 19 is never torn down, so after navigating away a record deletion still re-loads the old domain and can `goto()` the user to a stale register page.

Replace lines 19-24 with a subscription owned by the component lifecycle:

```ts
onMount(() => {
	const unsubscribe = refresh.subscribe((val) => {
		if (!val) return;

		domain.set(undefined);
		loadDomain();
		refresh.set(false);
	});

	return unsubscribe;
});
```

Merge this into the existing `onMount` at lines 27-33 — one `onMount` that does the lowercase redirect, awaits `loadDomain()`, and returns the unsubscribe function. Note that an `async` `onMount` callback's return value is **not** treated as a teardown by Svelte, so the lifecycle callback must stay synchronous: call `loadDomain()` without awaiting inside it, or register the subscription in a second, synchronous `onMount`.

**Verify:** `yarn typecheck`, `npx eslint .`, `yarn test:integration`. Manually: open a domain you own, delete a record, navigate home — no unexpected navigation should occur.

**Commit:** `fix(domain): unsubscribe from the refresh store on destroy`

---

#### Task 4.3 — Own the profile wallet subscription

**Modify:** `src/routes/profile/+page.svelte`

Same leak at line 22.

```ts
onMount(() =>
	walletAddress.subscribe(async (address) => {
		if (!address) return;

		loaded = false;
		domains = await $metaNamesSdk.domainRepository.findByOwner(address);
		loaded = true;
	})
);
```

Add `import { onMount } from 'svelte';`. Drop the `domainsFiltered = domains;` line — Task 4.1's reactive statement derives it.

**Verify:** `yarn test:unit`, `yarn typecheck`, `yarn test:integration`. Manually: connect a wallet, visit `/profile`, navigate away and back — domains still load, once.

**Commit:** `fix(profile): unsubscribe from the wallet store on destroy`

---

#### Task 4.4 — Make `Icon` props reactive

**Modify:** `src/components/Icon.svelte`

`const icon = \`ic:baseline-${key}\``(line 506) and the`alignClass`block (lines 511-516) run once at init, so an`icon`or`align`prop that changes later is ignored — e.g.`Chip.svelte`works around this today by rendering three separate`<Icon>` branches (`src/components/Chip.svelte:460-466`).

```ts
$: icon = `ic:baseline-${key}`;
$: alignClass = align === 'right' ? 'align-icon-right' : align === 'left' ? 'align-icon-left' : '';
```

Delete the `const icon` line and the imperative `alignClass` block.

**Verify:** `yarn test:unit`, `yarn typecheck`, `npx eslint .`, `yarn test:integration`. Manually: click a copy-type `Chip` — the icon must still swap to ✓ and back after 1 s.

> Leave the three-branch rendering in `Chip.svelte` in place — collapsing it is a separate, optional change and this task's contract is "no visible difference".

**Commit:** `fix(icon): make icon and align props reactive`

---

### Phase 5 — Cleanup

#### Task 5.1 — Drop the unused dependencies

**Modify:** `package.json`, `yarn.lock`

`@arisbh/marqueeck` and `@types/siema` have zero references in the repo (`grep -rn 'siema\|marqueeck' src/ vite.config.ts svelte.config.js` → no matches).

```bash
yarn remove @arisbh/marqueeck @types/siema
```

**Verify:**

```bash
yarn build && yarn typecheck && yarn test:unit
```

**Commit:** `chore(deps): remove unused marqueeck and siema types`

---

#### Task 5.2 — Merge the duplicate journal directories

**Modify:** `.jules/palette.md` · **Delete:** `.Jules/`

`.jules/` and `.Jules/` both exist and both contain a `palette.md`; on a case-insensitive filesystem they collide. Merge any unique content from `.Jules/palette.md` into `.jules/palette.md`, then:

```bash
git rm -r .Jules
```

**Verify:** `ls -d .jules .Jules 2>&1` → only `.jules` exists. `yarn lint` → clean.

**Commit:** `chore: merge the duplicate agent journal directories`

---

#### Task 5.3 — Move the Sentry DSN into config

**Create:** nothing · **Modify:** `src/lib/config.ts`, `src/hooks.client.ts`, `src/hooks.server.ts`, `.env.example`

The same DSN is hardcoded twice (`src/hooks.client.ts:5`, `src/hooks.server.ts:6`), both with `tracesSampleRate: 1.0` in production.

In `src/lib/config.ts` add to the `Config` type and object:

```ts
sentryDsn: string;
sentryTracesSampleRate: number;
```

```ts
const sentryDsn = optionalEnv(
	import.meta.env.VITE_SENTRY_DSN,
	'https://a3030e6b43e234337425afcedb4bc727@o4506739278544896.ingest.us.sentry.io/4506739280183296'
);
const sentryTracesSampleRate = environment === 'prod' ? 0.1 : 1.0;
```

Both hooks files then read `config.sentryDsn` and `config.sentryTracesSampleRate`.

Add to `.env.example`:

```
# Optional Sentry DSN override
VITE_SENTRY_DSN=
```

**Verify:** `yarn typecheck`, `yarn build`, `yarn test:unit`.

> Keeping the existing DSN as the fallback preserves current behaviour exactly; the sample-rate drop to 0.1 in production is the one intentional change — call it out in the commit body.

**Commit:** `refactor(sentry): read the dsn from config and sample prod traces at 10%`

---

#### Task 5.4 — Unify import specifiers on `$lib`

**Modify:** all files importing from `src/lib/…`

35 imports use `from 'src/lib/…'` and 37 use `from '$lib/…'`, sometimes both in the same file (`src/components/DomainPayment.svelte:2-3` vs `:6,10`). `$lib` is the SvelteKit convention and is already aliased in `svelte.config.js:17-18`.

Do this **one directory at a time**, running the verify block after each, so a bad rewrite is easy to bisect:

```bash
grep -rln "from 'src/lib" src/components
# then rewrite those files' specifiers: 'src/lib/x' -> '$lib/x'
```

Leave `from 'src/components/…'` and `from 'src/routes/…'` alone — those resolve via the `src/*` alias and have no `$`-prefixed equivalent.

**Verify after each directory:** `yarn typecheck` (0 errors), `npx eslint .`, `yarn test:unit`, `yarn build`.

**Commit (one per directory):** `chore(imports): use $lib specifiers in <dir>`

---

#### Task 5.5 — Replace the opaque sort trick with a tested comparator

**Create:** `src/lib/sort.ts`, `src/lib/sort.test.ts` · **Modify:** `src/routes/profile/DomainsTable.svelte`

`src/routes/profile/DomainsTable.svelte:147-149` reads `[a[sort], b[sort]][sortDirection === 'ascending' ? 'slice' : 'reverse']()` — an unreadable way to conditionally swap two values, on top of an in-place `domains.sort()` that mutates the prop array.

Failing test first:

```ts
import { describe, it, expect } from 'vitest';
import { sortByKey } from './sort';

const rows = [
	{ tokenId: 3, name: 'c.meta' },
	{ tokenId: 1, name: 'a.meta' },
	{ tokenId: 2, name: 'b.meta' }
];

describe('sortByKey', () => {
	it('sorts numbers ascending', () => {
		expect(sortByKey(rows, 'tokenId', 'ascending').map((r) => r.tokenId)).toEqual([1, 2, 3]);
	});

	it('sorts numbers descending', () => {
		expect(sortByKey(rows, 'tokenId', 'descending').map((r) => r.tokenId)).toEqual([3, 2, 1]);
	});

	it('sorts strings with locale compare', () => {
		expect(sortByKey(rows, 'name', 'ascending').map((r) => r.name)).toEqual([
			'a.meta',
			'b.meta',
			'c.meta'
		]);
	});

	it('does not mutate its input', () => {
		const input = [...rows];
		sortByKey(input, 'tokenId', 'descending');

		expect(input).toEqual(rows);
	});
});
```

Run → fails. Then `src/lib/sort.ts`:

```ts
export type SortDirection = 'ascending' | 'descending';

export function sortByKey<T>(rows: T[], key: keyof T, direction: SortDirection): T[] {
	const sign = direction === 'ascending' ? 1 : -1;

	return [...rows].sort((a, b) => {
		const [aVal, bVal] = [a[key], b[key]];
		if (typeof aVal === 'string' && typeof bVal === 'string')
			return sign * aVal.localeCompare(bVal);

		return sign * (Number(aVal) - Number(bVal));
	});
}
```

In `DomainsTable.svelte`, replace `handleSort` (lines 145-154) with `domains = sortByKey(domains, sort, sortDirection);`.

**Verify:** `yarn test:unit`, `yarn typecheck`, `yarn test:integration`. Manually: connect a wallet with ≥2 domains, click both column headers, confirm ascending/descending both work.

**Commit:** `refactor(profile): replace the sort trick with a tested comparator`

---

#### Task 5.6 — Extract the account-balance GraphQL query

**Modify:** `src/lib/wallet.ts` · **Create:** `src/lib/queries.ts`

The 20-line GraphQL document at `src/lib/wallet.ts:27` is a single escaped-newline string literal, unreadable and undiffable.

`src/lib/queries.ts`:

```ts
export const accountCoinsQuery = `query AccountSingleQuery($address: BLOCKCHAIN_ADDRESS!) {
	account(address: $address) {
		...Coins_Account
	}
}

fragment Byoc_Account on Account {
	displayCoins {
		symbol
		balance
		conversionRate
		balanceAsGas
	}
	id
}

fragment Coins_Account on Account {
	...Byoc_Account
	...NonBridgeableCoins_Account
}

fragment NonBridgeableCoins_Account on Account {
	mpc20Balances {
		contract
		symbol
		balance
	}
}`;
```

`src/lib/wallet.ts:25-29` becomes `const body = { query: accountCoinsQuery, variables: { address } };`.

**Verify:** `yarn typecheck`, `yarn build`. Manually: connect a wallet, open a register page, click **Approve fees** — an insufficient-balance case must still produce the "Add funds" alert, which proves the query still returns `displayCoins`.

**Commit:** `refactor(wallet): extract the account coins graphql document`

---

## FINAL VERIFICATION

Run from a clean checkout. All five must pass.

```bash
yarn install --frozen-lockfile
yarn lint
yarn typecheck
yarn test:unit
yarn test:integration
```

Expected results after the full plan:

| Command                 | Expected                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lint`             | `All matched files use Prettier code style!` then ESLint exits 0 with no output. **Baseline was: prettier failed on `.jules/palette.md`, ESLint exited 2 with no config found.** |
| `yarn typecheck`        | `svelte-check found 0 errors and 0 warnings`. **Baseline was 3 errors in 3 files** (and `yarn check` never invoked svelte-check at all).                                         |
| `yarn test:unit`        | ~16 test files, ~50 tests, all passing, process exits. **Baseline was 1 file / 1 test asserting `1 + 2 === 3`, in watch mode.**                                                  |
| `yarn test:integration` | 3 passing Playwright specs. **Baseline was 1 spec asserting a heading that does not exist, with no browsers installed.**                                                         |
| `yarn build`            | Succeeds.                                                                                                                                                                        |

Manual smoke checklist on testnet before deploying (these flows have no automated coverage even after this plan, because they require a signing wallet):

- [ ] Search a name on `/` → available names route to `/register/<name>`, taken names to `/domain/<name>`
- [ ] Register a domain end to end (approve fees → pay → land on the domain page)
- [ ] Renew a domain
- [ ] Transfer a domain
- [ ] Add, edit and delete a record on a domain you own
- [ ] Cast a vote on `/proposals/tld-migration`
- [ ] Connect and disconnect each of MetaMask, Partisia Wallet and Ledger
