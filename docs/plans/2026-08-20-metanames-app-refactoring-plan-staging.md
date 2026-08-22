# MetaNames App Refactoring Implementation Plan — `staging` revision

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Restore the two quality gates that are still dead on `staging` (ESLint never runs, svelte-check reports 16 errors), prune the tests that assert nothing, then remove the duplicated transaction boilerplate, the duplicated page loaders and the store-subscription leaks — without changing any user-visible behaviour.

**Architecture:** Keep SvelteKit + Svelte 4 + SMUI exactly as-is. Extract the small amount of logic that is still trapped inside components (`transaction.ts`, `loaders.ts`, `sort.ts`, `filter.ts`, `env.ts`) into pure, unit-tested modules under `src/lib/`, so it can be tested in Node without a wallet or a DOM. Every extraction is a mechanical move preceded by a test that pins today's behaviour; components keep their current markup and props. Blockchain write flows stay covered by the Playwright suite that `staging` already ships.

**Tech Stack:** SvelteKit 2 / Svelte 4, TypeScript 5.6 (strict), SMUI 7, `@metanames/sdk` 6.3, `partisia-blockchain-applications-sdk`, `@ledgerhq/hw-transport-webusb`, Sentry, Vite 5, Vitest 2 + `@vitest/coverage-v8`, Playwright 1.58, Prettier 3 + `prettier-plugin-svelte`, ESLint 9, npm (there is no `yarn.lock` — `package-lock.json` is the committed lockfile since `f41ba42`).

---

## STAGING DELTA SUMMARY

Baseline: `staging` @ `99982a7` ("Integration tests (#190)"), 30 commits ahead of `main`. All numbers below were measured on this checkout, not estimated.

### Current real gate numbers

| Command                     | Real result on `staging`                                                                                                                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`              | **Fails at Prettier, ESLint still never runs.** `Code style issues found in 27 files` → exit 1.                                                                                                                                                                                                              |
| `npx eslint .`              | **exit 2** — `ESLint couldn't find an eslint.config.(js\|mjs\|cjs) file`, plus `ESLintIgnoreWarning: The ".eslintignore" file is no longer supported`. `.eslintrc.cjs` + `.eslintignore` are still the only configs; there is no `eslint.config.*`. **Zero files have been linted since the ESLint 9 bump.** |
| `npm run check`             | **16 errors, 0 warnings, 9 files** (1740 files scanned). Was 3 errors / 3 files on `main`.                                                                                                                                                                                                                   |
| `yarn check`                | Still shadowed by Yarn 1's built-in command → `Found 61 errors.`, exit 1. Never invokes svelte-check.                                                                                                                                                                                                        |
| `npx vitest run`            | **14 files, 175 tests, all passing, 4.8 s.**                                                                                                                                                                                                                                                                 |
| `npx vitest run --coverage` | **All files 10.42 % stmts.** `src/lib` **73.29 % stmts / 78.57 % branch / 70 % funcs**; `src/lib/stores` 52.94 %; `src/lib/server/config.ts` 0 %; every `.svelte` file 0 %.                                                                                                                                  |
| `npm run test:unit`         | Still bare `vitest` (`package.json:19`) — watch mode locally.                                                                                                                                                                                                                                                |
| `npm run test:integration`  | Playwright, 13 spec files under `tests/` (`tests/api/*.spec.ts`, `tests/e2e/*.spec.ts`). Requires a dev server + testnet key; not run in this audit.                                                                                                                                                         |

Per-file unit test counts (baseline for the final tally):

```
domain-transfer 14 · types 23 · api-endpoints 10 · dns-records 29 · sdk 24 · url 14
utils 13 · domain-search 4 · wallet 6 · domain-registration 9 · stores 14 · api 6
domain-validator 8 · index 1                                          = 175 tests
```

### What `staging` already fixed vs the `main`-based audit

| Original finding                                                             | Status on `staging`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1 — two mainnet proposal contract addresses**                              | **OUT OF SCOPE (owner decision) and mostly moot.** `#190` deleted `src/routes/proposals/`, `src/routes/api/proposals/` and `src/lib/proposal.ts`. The only survivors are two orphaned constants: `src/lib/config.ts:27-32,43` and the whole of `src/lib/server/config.ts`. Nothing imports them. Task 4.3 **deletes** both — it does not reconcile them, and no proposal/voter behaviour is planned.                                                                                                                                                                                                                                                                     |
| **2 — voter endpoints leak signing state**                                   | **ALREADY FIXED by deletion.** `src/routes/api/proposals/voters/{add,remove}/+server.ts` no longer exist. OUT OF SCOPE.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **3 — ESLint dead, `yarn check` shadowed**                                   | **STILL PRESENT, unchanged.** No `eslint.config.*` (`ls eslint.config.*` → no match); `.eslintrc.cjs` and `.eslintignore` still tracked. `yarn check` still hits the Yarn builtin.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **4 — no test coverage anywhere**                                            | **LARGELY FIXED.** 0 → 175 unit tests, `src/lib` at 73.29 % stmts; 1 boilerplate Playwright spec → 13 real spec files incl. authenticated register/renew/transfer/records flows against testnet. Residual gaps below.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **5 — transaction boilerplate copy-pasted 8×**                               | **STILL PRESENT, unchanged** — still 8 call sites across 7 files (`grep -rc "alertTransactionAndFetchResult(" src/routes src/components` → 8): `src/routes/register/[name]/+page.svelte:37`, `src/routes/register/[name]/SubdomainRegistration.svelte:39`, `src/routes/domain/[name]/renew/+page.svelte:23`, `src/routes/domain/[name]/transfer/+page.svelte:40`, `src/components/DomainPayment.svelte:85`, `src/components/Records.svelte:47`, `src/components/Record.svelte:42,49`.                                                                                                                                                                                    |
| **6 — no service layer, 20 scattered SDK calls; two byte-identical loaders** | **CHANGED.** Now **19** direct `domainRepository.*` / `contractRepository.*` calls across `src/routes` + `src/components`. `src/routes/domain/[name]/renew/+page.ts` and `.../transfer/+page.ts` are still byte-identical (`diff` → no output). **The `services/domain.ts` layer from the original plan is dropped as speculative** — the three write flows it would wrap are now covered end-to-end by `tests/e2e/blockchain-ops.spec.ts`, `domain-renewal.spec.ts` and `domain-transfer.spec.ts`, so a mock-the-SDK unit layer would re-assert what the e2e suite already proves. Only the genuinely duplicated pieces (`runTransaction`, the shared loader) are kept. |
| **7 — unset env vars become the string `"undefined"`**                       | **STILL PRESENT.** `src/lib/config.ts:23-24`. No `.env.example` in the repo.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **8 — store subscriptions never unsubscribed**                               | **STILL PRESENT.** `src/routes/domain/[name]/+page.svelte:19`, `src/routes/profile/+page.svelte:22`, `src/routes/+layout.svelte:40,47`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **9 — profile search never resets when cleared**                             | **STILL PRESENT.** `src/routes/profile/+page.svelte:18-20`; `isFuzzyMatch:36-43` still ends in a dead `else false;` and its `startsWith` branch is subsumed by `includes`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **10 — type-safety escapes**                                                 | **STILL PRESENT and worse.** `src/lib/wallet.ts:6` (`= any`), `:16` (`as any`), `src/routes/WalletConnectButton.svelte:70` (`@ts-ignore`), plus **17 new `any` uses** introduced by the test PRs. The `DomainsTable` sort trick survives at `src/routes/profile/DomainsTable.svelte:32-34`.                                                                                                                                                                                                                                                                                                                                                                              |
| **11 — dead code and dead deps**                                             | **PARTIAL.** `@arisbh/marqueeck` is **gone** from `package.json`. `@types/siema` remains and still has zero references. `jsdom@29` was added by `#187` and has **zero references** (`vite.config.ts` sets no `environment`). Unused `{ url }` params still at `src/routes/api/domains/recent/+server.ts:4` and `stats/+server.ts:4`; unused `type DomainProjection` import still at `recent/+server.ts:1`. `.jules/` and `.Jules/` both still exist. `.eslintignore` still dead.                                                                                                                                                                                         |
| **12 — inconsistent conventions**                                            | **PARTIAL.** Import split is now 23 × `from 'src/lib/…'` vs 37 × `from '$lib/…'`. Sentry DSN still hardcoded + duplicated (`src/hooks.client.ts:5`, `src/hooks.server.ts:6`, both `tracesSampleRate: 1.0`). `'TEST_COIN'` still hardcoded at `SubdomainRegistration.svelte:37`. The 20-line GraphQL document is still one escaped string at `src/lib/wallet.ts:27`.                                                                                                                                                                                                                                                                                                      |

### What `staging` regressed

- **svelte-check 3 → 16 errors.** Ten of the sixteen live in code the test PRs added: `src/lib/sdk.test.ts` (4), `src/lib/api-endpoints.test.ts` (3), `src/lib/dns-records.test.ts` (1), `src/routes/WalletConnectButton.svelte:134` (1, the new `testid` prop), `src/components/DomainPayment.svelte:134` (1, `fees` possibly `null`). The other six are pre-existing.
- **Prettier 1 → 27 failing files.** The new test files and two edited components were never formatted; 8 of the 27 are vendored `static/~@fontsource/**` CSS that should never have been in Prettier's scope.
- **Tests that assert nothing.** `src/lib/types.test.ts` (23 tests) imports **nothing** from `src/` — every assertion builds a template string locally and asserts against itself. Coverage confirms it: `src/lib/error.ts` and `src/lib/types.ts` are both at **0 %** despite that file claiming to test them. `src/lib/domain-registration.test.ts:6-58` re-tests `fetchApiJson` already covered by `src/lib/api.test.ts`. `src/index.test.ts` is still `1 + 2 === 3`.

### Dropped from the original plan

| Original task                                                                          | Why it is gone                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.5 / 1.6 — jsdom + `@testing-library/svelte` harness, `LoadingButton` component tests | The 13-file Playwright suite now drives `LoadingButton` through the real register/renew/transfer/records flows. Adding a second, mock-heavy harness for the same component is duplicated effort (YAGNI). `jsdom` is instead removed as an unused dep (Task 8.1). |
| 0.6 — replace the boilerplate Playwright spec                                          | Done by `#190`.                                                                                                                                                                                                                                                  |
| 1.1–1.5 — characterize `utils`, `url`, `api`, `proposal`                               | `utils`/`url`/`api` are covered (13 / 14 / 6 tests). `proposal.ts` is deleted. Only `alertTransactionAndFetchResult` is still uncovered (`utils.ts:17-32`) → Task 5.1.                                                                                           |
| 2.1 / 2.2 — unify + rewire the proposal contract address                               | OUT OF SCOPE per owner. Replaced by Task 4.3, which deletes the orphans.                                                                                                                                                                                         |
| 3.4 — `src/lib/services/domain.ts`                                                     | Speculative; see finding 6 above.                                                                                                                                                                                                                                |
| 3.5 — share voter diffing                                                              | The endpoints no longer exist.                                                                                                                                                                                                                                   |

---

## TASKS

Conventions for every task: **tabs** for indentation, single quotes, no trailing commas, 100-char print width (`.prettierrc`). Run `npm run format` before committing if Prettier complains. Use **npm**, not yarn — there is no `yarn.lock`, and `yarn check` is shadowed by Yarn's builtin. **Never** commit with a failing test: `npx vitest run` must be green after every single task.

Baseline to hold: **175 tests passing** at the start; the running total is stated per task.

---

### Phase 1 — Repair the gates

#### Task 1.1 — Stop Prettier choking on journals and vendored CSS

**Modify:** `.prettierignore`

Prettier fails the whole `lint` script before ESLint ever runs. Two of the 27 offenders are not ours: `.jules/palette.md` (agent journal) and eight tracked `static/~@fontsource/**` files (vendored font CSS, `git ls-files static/ | grep -c fontsource` → 9).

Append to `.prettierignore`:

```
# Agent journals
.jules
.Jules

# Vendored third-party CSS
static/~@fontsource
static/~normalize.css
```

**Verify:**

```bash
npx prettier --plugin prettier-plugin-svelte --check . 2>&1 | tail -3
```

Expected: still fails, but the count drops from `27 files` to **`18 files`** and no `.jules`/`static/~` entries remain in the list.

**Commit:** `chore(lint): exclude agent journals and vendored css from prettier`

---

#### Task 1.2 — Format the files the test PRs never formatted

**Modify:** the 18 files Task 1.1 left failing (8 × `src/lib/*.test.ts`, 5 × `tests/**/*.spec.ts`, `src/components/DomainPayment.svelte`, `src/routes/WalletConnectButton.svelte`, `TESTING_PLAN.md`, `docs/plans/*.md`)

```bash
npm run format
```

This is a whitespace-only commit. Review the diff to confirm nothing but formatting changed:

```bash
git diff --stat
git diff -- src/components/DomainPayment.svelte src/routes/WalletConnectButton.svelte
```

**Verify:**

```bash
npx prettier --plugin prettier-plugin-svelte --check .
npx vitest run
```

Expected: `All matched files use Prettier code style!`, then **14 files / 175 tests passing**.

**Commit:** `style: format files added by the unit and integration test prs`

---

#### Task 1.3 — Migrate ESLint to flat config so it actually runs

**Create:** `eslint.config.js` · **Delete:** `.eslintrc.cjs`, `.eslintignore`

`@eslint/js@9.39.5`, `globals@14.0.0` and `svelte-eslint-parser@0.43.0` are already resolved in `node_modules` as transitive deps; declare the first two explicitly.

```bash
npm install -D --legacy-peer-deps @eslint/js globals
```

`eslint.config.js` — mirrors the rule set `.eslintrc.cjs` declared, so the findings in Task 3.1/3.2 are the ones the repo always intended to enforce:

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
			'coverage/',
			'package/',
			'node_modules/',
			'src/styles/theme/',
			'static/',
			'test-results/',
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
npx eslint . 2>&1 | tail -5
```

Expected: ESLint **runs** — no `couldn't find an eslint.config` error and no `ESLintIgnoreWarning`. It will report real problems; that is Phase 3. **Record the exact `✖ N problems (N errors, N warnings)` line before continuing** — Phase 3 drives it to zero.

**Commit:** `chore(lint): migrate to eslint 9 flat config`

---

#### Task 1.4 — Make the npm scripts CI-safe and document the gates

**Modify:** `package.json`, `README.md`

`test:unit` is bare `vitest` (watch mode), `test` runs integration before unit (slow feedback first), and there is no `typecheck` alias to steer people away from the Yarn-shadowed `check`.

Replace the scripts in `package.json:13-19` with:

```json
		"test": "npm run test:unit && npm run test:integration",
		"typecheck": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check": "npm run typecheck",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --plugin prettier-plugin-svelte --check . && eslint .",
		"format": "prettier --plugin prettier-plugin-svelte --write .",
		"test:integration": "playwright test",
		"test:unit": "vitest run",
		"test:unit:watch": "vitest",
		"test:coverage": "vitest run --coverage"
```

Append to `README.md` after the `## Developing` section:

    ## Quality gates

    ```bash
    npm run lint       # prettier --check + eslint
    npm run typecheck  # svelte-check
    npm run test:unit  # vitest, single run
    npm run test:coverage
    npm test           # unit + playwright integration
    ```

    Use `npm`, not `yarn`: the repo's lockfile is `package-lock.json`, and `yarn check`
    is shadowed by Yarn's built-in dependency checker so it never runs svelte-check.

**Verify:**

```bash
npm run test:unit    # exits on its own, does not watch: 14 files / 175 tests
npm run typecheck    # runs svelte-check, reports 16 errors
```

**Commit:** `chore(scripts): make test scripts ci-safe and document the quality gates`

---

### Phase 2 — Prune the tests that assert nothing

These four tasks come before the ESLint and typecheck cleanups on purpose: they account for 21 of the new `any` uses and 1 of the 16 typecheck errors, and fixing code that is about to be deleted is wasted work. Every one of them is a **net coverage gain**, because the deleted assertions were tautologies while the replacements exercise real modules.

#### Task 2.1 — Delete the placeholder unit test

**Delete:** `src/index.test.ts`

It asserts `1 + 2 === 3`. The suite has 174 real tests now.

```bash
git rm src/index.test.ts
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
```

Expected: **13 files / 174 tests passing**.

**Commit:** `test: drop the 1+2 placeholder test`

---

#### Task 2.2 — Replace the tautological `types.test.ts` with real tests

**Rewrite:** `src/lib/types.test.ts` · **Create:** `src/lib/error.test.ts`

`src/lib/types.test.ts` has exactly one import — `vitest`. All 23 tests build a string or object literal locally and assert against it; none touch `src/lib/types.ts` or `src/lib/error.ts`, both of which coverage reports at **0 %**. Its "URL Helpers" block also duplicates the 14 real tests in `src/lib/url.test.ts`.

Replace the whole of `src/lib/types.test.ts` with the only part that has a real subject:

```ts
import { describe, it, expect } from 'vitest';
import { DomainTab } from './types';

describe('DomainTab', () => {
	it('exposes the details tab', () => {
		expect(DomainTab.details).toBe('details');
	});

	it('exposes the settings tab', () => {
		expect(DomainTab.settings).toBe('settings');
	});
});
```

Create `src/lib/error.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { InsufficientBalanceError } from './error';

describe('InsufficientBalanceError', () => {
	it('carries the coin that ran out', () => {
		expect(new InsufficientBalanceError('ETH').coin).toBe('ETH');
	});

	it('formats the message from the coin', () => {
		expect(new InsufficientBalanceError('MATIC').message).toBe('Insufficient balance for MATIC');
	});

	it('is named so it can be discriminated in a catch block', () => {
		expect(new InsufficientBalanceError('ETH').name).toBe('InsufficientBalanceError');
	});

	it('is an Error', () => {
		expect(new InsufficientBalanceError('ETH')).toBeInstanceOf(Error);
	});
});
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npx vitest run --coverage 2>&1 | grep -E "error\.ts|types\.ts"
```

Expected: **14 files / 157 tests passing** (`types` 23 → 2, `error` +4), and `error.ts` / `types.ts` move off 0 %.

**Commit:** `test(lib): replace tautological type assertions with real error and enum tests`

---

#### Task 2.3 — Drop the duplicated `fetchApiJson` block

**Modify:** `src/lib/domain-registration.test.ts`

Lines 6-58 re-test `fetchApiJson`'s four paths, which `src/lib/api.test.ts` already covers with six tests (including the Sentry capture path this copy omits). The remaining blocks in the file — "Types" and "Error Handling" — are object-literal tautologies, but they at least type-check against the real interfaces, so leave them.

Delete the `describe('fetchApiJson', ...)` block (lines 6-58) and the now-unused `fetchApiJson` import and `beforeEach` fetch stub at the top of the file. Keep `import type { DomainFeesResponse, DomainPaymentParams, ApiError } from './types';`.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
```

Expected: **14 files / 153 tests passing** (`domain-registration` 9 → 5).

**Commit:** `test(lib): drop fetchApiJson tests duplicated from api.test.ts`

---

#### Task 2.4 — Delete the test for a config option that does not exist

**Modify:** `src/lib/dns-records.test.ts`

`src/lib/dns-records.test.ts:96-99` calls `metaNamesSdkFactory({ timeout: 30000 })`. `ConfigOverrides extends Partial<Config>` (`node_modules/@metanames/sdk/dist/providers/config.d.ts:8-27`) has no `timeout` field — this is svelte-check error 4/16, and the assertion (`expect(sdk).toBeDefined()`) is already made by the `cache_ttl` test three lines above.

Delete lines 96-99:

```ts
it('should create SDK with custom timeout', () => {
	const sdk = metaNamesSdkFactory({ timeout: 30000 });
	expect(sdk).toBeDefined();
});
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck 2>&1 | grep -c ERROR
```

Expected: **14 files / 152 tests passing**; typecheck errors **16 → 15**.

**Commit:** `test(sdk): drop assertion for a non-existent timeout config option`

---

### Phase 3 — Zero the ESLint gate

Work from the count recorded in Task 1.3. Do **not** silence findings with `eslint-disable` unless the rule is genuinely wrong for the case; the existing `// eslint-disable-next-line @typescript-eslint/no-unused-vars` at `src/routes/DomainSearch.svelte:25` is legitimate (the parameter exists so the reactive statement tracks `domainName`) — keep it.

#### Task 3.1 — Fix ESLint findings in application source

**Modify:** `src/routes/api/domains/recent/+server.ts`, `src/routes/api/domains/stats/+server.ts`, `src/lib/wallet.ts`, plus whatever else Task 1.3 surfaced under `src/routes/` and `src/components/`

Known, verified findings:

- `src/routes/api/domains/recent/+server.ts:1` — `type DomainProjection` is imported and never used. Drop it: `import { getRecentDomains, handleError } from '$lib/server';`
- `src/routes/api/domains/recent/+server.ts:4` and `src/routes/api/domains/stats/+server.ts:4` — `export async function GET({ url }) {` destructures an unused `url`. Change both to `export async function GET() {`.
- `src/lib/wallet.ts:6` — `export type OptionalWalletClient = any;` trips `@typescript-eslint/no-explicit-any`. The two consumers (`getAddress`, and `WalletConnectButton`) only probe for `'connection' in wallet` / `'request' in wallet`, so widen honestly instead of using `any`:

  ```ts
  export type OptionalWalletClient = object | undefined | null;
  ```

  If this cascades into new `npm run typecheck` errors at the `wallet.connection?.account.address` / `wallet.request(...)` accesses in `getAddress` (`:62-70`), **stop and revert this bullet only**, leave a `// eslint-disable-next-line @typescript-eslint/no-explicit-any` on line 6, and report it — properly typing the two wallet clients is a separate task, not this one.

- `src/lib/wallet.ts:16` — `config.permissions as any`. `PartisiaSdk.connect` wants its own permission union; replace the cast with the narrow one it needs rather than `any`: `permissions: config.permissions as ('sign' | 'private_key')[]`. If the SDK's parameter type rejects that, keep `as never[]`-free code and add a targeted disable comment with a one-line reason.

**Verify:**

```bash
npx eslint src/routes src/components src/lib --ignore-pattern '**/*.test.ts'
npm run typecheck 2>&1 | grep -c ERROR   # still 15 — unchanged by this task
npx vitest run                            # 14 files / 152 tests
```

Expected: exit 0, no output from the first command.

**Commit:** `fix(lint): resolve eslint findings in application source`

---

#### Task 3.2 — Fix ESLint findings in the test files

**Modify:** `src/lib/domain-registration.test.ts`, `src/lib/wallet.test.ts`, `src/lib/domain-transfer.test.ts`, `src/lib/api-endpoints.test.ts`, `src/lib/sdk.test.ts`

The remaining `no-explicit-any` and `no-unused-vars` hits are all in test scaffolding. Fix them mechanically:

- Six `(global.fetch as any).mockResolvedValueOnce(...)` / `.mockRejectedValueOnce(...)` sites (`domain-registration.test.ts:19,30,41,52`, `wallet.test.ts:118,131`) → use Vitest's typed helper:

  ```ts
  vi.mocked(global.fetch).mockResolvedValueOnce({
  ```

  Add `vi` to the `vitest` import where it is missing.

- `src/lib/domain-transfer.test.ts:192` — `vi.fn().mockImplementation((params: any) => {` → type the shape it actually reads:

  ```ts
  		const mockTransfer = vi.fn().mockImplementation((params: { domain: string; from: string; to: string }) => {
  ```

- Unused mock-factory parameters: `src/lib/api-endpoints.test.ts:22` `(domain: string, coin: string)` and `src/lib/sdk.test.ts:33` `(klass: string)` — neither body uses its parameter. Prefix with `_` (`_domain`, `_coin`, `_klass`) or drop the parameter list entirely where the mock takes no arguments in any call site.

**Verify:**

```bash
npx eslint .
npx vitest run 2>&1 | tail -4
```

Expected: **ESLint exits 0 with no output — the lint gate is green for the first time since the ESLint 9 bump.** Tests still **14 files / 152 tests**.

```bash
npm run lint
```

Expected: `All matched files use Prettier code style!` then silence, exit 0.

**Commit:** `fix(lint): resolve eslint findings in test files`

---

### Phase 4 — Zero the typecheck gate (15 errors → 0)

#### Task 4.1 — Fix the four `sdk.test.ts` type errors

**Modify:** `src/lib/sdk.test.ts`

Two errors on line 80 and two on lines 164-165.

Line 79-82 references `RecordClassEnum` as a value, but the identifier only exists inside the `vi.mock` factory — it is not imported. `getRecordClassFrom` takes a `string`, so the cast is pointless:

```ts
it('should return undefined for unknown record class string', () => {
	const result = getRecordClassFrom('UnknownClass');

	expect(result).toBeUndefined();
});
```

Lines 162-166 pass a `string` and `null` to a validator whose real signature is `IValidatorInterface<IRecord>.validate(record: IRecord)` (`node_modules/@metanames/sdk/dist/validators/record-validator.d.ts:2`). The mock validator is `(value: unknown) => value !== null`, so keep both outcomes and make the intent explicit:

```ts
it('should return a validator that can validate values', () => {
	const validator = getValidator('Twitter');

	expect(validator.validate({ class: 0, data: 'someValue' } as unknown as IRecord)).toBe(true);
	expect(validator.validate(null as unknown as IRecord)).toBe(false);
});
```

Add to the top of the file:

```ts
import type { IRecord } from '@metanames/sdk';
```

**Verify:**

```bash
npm run typecheck 2>&1 | grep ERROR | grep -c sdk.test
npx vitest run 2>&1 | tail -4
```

Expected: `0`; total typecheck errors **15 → 11**; tests still 152.

**Commit:** `fix(test): type the sdk validator and record-class assertions`

---

#### Task 4.2 — Fix the three `api-endpoints.test.ts` type errors

**Modify:** `src/lib/api-endpoints.test.ts`

Lines 154, 170 and 183 each do `const { metaNamesSdkFactory } = await import('@metanames/sdk');`. `metaNamesSdkFactory` is **ours** (`src/lib/sdk.ts:11`), not an SDK export — the `vi.mock` factory at `:47-60` invents it. Because the mock's `MetaNamesSdk` constructor and its `metaNamesSdkFactory` return the _same_ `mockDomainRepository` object (`:28-36`), importing the real factory from `./sdk` yields the identical mock instance, so behaviour is unchanged.

Add this helper just below the `import { handleError, apiError, getStats } from '$lib/server';` line:

```ts
const mockedDomainRepository = async () => {
	const { metaNamesSdkFactory } = await import('./sdk');

	return metaNamesSdkFactory({ cache_ttl: 0 }).domainRepository as unknown as Record<
		string,
		ReturnType<typeof vi.fn>
	>;
};
```

Then in each of the three tests replace:

```ts
const { metaNamesSdkFactory } = await import('@metanames/sdk');
const sdk = metaNamesSdkFactory({ cache_ttl: 0 });

sdk.domainRepository.getAll = vi.fn().mockResolvedValue(mockDomains);
```

with:

```ts
const domainRepository = await mockedDomainRepository();

domainRepository.getAll = vi.fn().mockResolvedValue(mockDomains);
```

(and likewise for `count` / `getOwners`).

**Verify:**

```bash
npm run typecheck 2>&1 | grep ERROR | grep -c api-endpoints
npx vitest run 2>&1 | tail -4
```

Expected: `0`; total **11 → 8**; tests still **14 files / 152 tests** (all three `getStats` tests must still pass — if `getStats` now sees the unmocked repository, the helper is resolving a different instance; report rather than papering over it).

**Commit:** `fix(test): resolve the sdk factory from $lib/sdk instead of the sdk package`

---

#### Task 4.3 — Delete the orphaned proposal config

**Delete:** `src/lib/server/config.ts` · **Modify:** `src/lib/config.ts`, `src/lib/dns-records.test.ts`

`#190` deleted every consumer. `grep -rn "server/config\|proposalsWalletPrivateKey" src/ tests/` returns only the definitions themselves. The file's `import { PROPOSALS_WALLET_PRIVATE_KEY } from '$env/static/private'` is svelte-check error 8/15 and breaks any checkout without a `.env`.

This is dead-code removal, **not** a fix for the two-mainnet-address finding: both addresses go away, and no proposal or voter behaviour is introduced, changed or preserved.

```bash
git rm src/lib/server/config.ts
```

In `src/lib/config.ts`, delete the `tldMigrationProposalContractAddress: string;` line from the `Config` type (`:14`), the `tldMigrationProposal` block (`:27-32`), and the `tldMigrationProposalContractAddress,` entry from the exported object (`:43`).

In `src/lib/dns-records.test.ts`, delete the matching line from the `vi.mock('./config', ...)` fixture (`:15`):

```ts
		tldMigrationProposalContractAddress: '021e68773e9bd5fc28381802c4b24899499f039ea9',
```

**Verify:**

```bash
grep -rn "tldMigrationProposal\|PROPOSALS_WALLET" src/ tests/    # no output
npm run typecheck 2>&1 | grep -c ERROR
npx eslint . && npx vitest run 2>&1 | tail -4
npm run build
```

Expected: total typecheck errors **8 → 7**; tests still 152; build succeeds.

**Commit:** `chore: remove the orphaned tld-migration proposal config`

---

#### Task 4.4 — Make the wallet-connect test hook a real data attribute

**Modify:** `src/routes/WalletConnectButton.svelte`

`:134` passes `{testid}` to SMUI's `Button`, whose props are `OwnProps & HTMLButtonAttributes & DataAttrs` — `testid` is not among them (svelte-check error). Everything else in the repo uses `data-testid` (e.g. `src/components/DomainPayment.svelte:129,139`), and no Playwright spec selects on `[testid=...]` (`grep -rn "testid" tests/` → only `data-testid`; the wallet helpers select `button.mdc-top-app-bar__action-item`).

Change `:131`:

```svelte
export let testid: string | undefined = undefined;
```

and `:134`:

```svelte
<Button variant={connectButtonVariant} on:click={toggleMenu} data-testid={testid}>
```

`src/routes/WalletConnectStatus.svelte:22` keeps passing `testid="wallet-connect-btn"` unchanged. Net DOM change: the stray `testid=""` attribute on every other connect button disappears, and the one intentional hook becomes `data-testid="wallet-connect-btn"`.

**Verify:**

```bash
npm run typecheck 2>&1 | grep -c ERROR
npx eslint . && npx vitest run 2>&1 | tail -4
```

Expected: **7 → 6**.

**Commit:** `fix(wallet): expose the connect button test hook as data-testid`

---

#### Task 4.5 — Guard the awaited fees against `null`

**Modify:** `src/components/DomainPayment.svelte`

`:33-35` resolves `loadFees` to `Promise.resolve(null)` when `!browser`, so the `{:then fees}` block's `{#if 'symbol' in fees}` at `:134` can receive `null` (svelte-check: `'fees' is possibly 'null'`).

Change `:134` from:

```svelte
			{#if 'symbol' in fees}
```

to:

```svelte
			{#if fees && 'symbol' in fees}
```

Behaviour is unchanged — `'symbol' in null` would have thrown, so the branch was already unreachable with a real `null`.

**Verify:**

```bash
npm run typecheck 2>&1 | grep -c ERROR
npx eslint . && npx vitest run 2>&1 | tail -4
```

Expected: **6 → 5**.

**Commit:** `fix(payment): guard the fees branch against a null server-side result`

---

#### Task 4.6 — Widen the approve-error handler to `unknown`

**Modify:** `src/components/DomainPayment.svelte`

`LoadingButton` declares `onError: (error: unknown) => Promise<void>` (`src/components/LoadingButton.svelte:12`); `handleApproveError` narrows the parameter to `Error` (`DomainPayment.svelte:54`), which is unsound and rejected under strict function types.

Change `:54` from:

```ts
	async function handleApproveError(error: Error) {
```

to:

```ts
	async function handleApproveError(error: unknown) {
```

The body already re-narrows with `error instanceof InsufficientBalanceError` / `error && error instanceof Error` and falls back to `'Something went wrong'`, so no other line changes.

**Verify:**

```bash
npm run typecheck 2>&1 | grep -c ERROR
npx eslint . && npx vitest run 2>&1 | tail -4
```

Expected: **5 → 4**.

**Commit:** `fix(payment): widen the approve error handler to unknown`

---

#### Task 4.7 — Narrow the optional route params

**Modify:** `src/routes/domain/[name]/+page.svelte`, `src/routes/register/[name]/+page.svelte`

SvelteKit types `$page.params.name` as `string | undefined`, producing three errors: `domain/[name]/+page.svelte:28,37` and `register/[name]/+page.svelte:56`. Both routes are `[name]` segments, so the param is always present at runtime — the fallback is unreachable and the behaviour is unchanged.

`src/routes/domain/[name]/+page.svelte:15`:

```ts
const domainName = $page.params.name ?? '';
```

`src/routes/register/[name]/+page.svelte:22`:

```ts
const nameParam = $page.params.name ?? '';
```

**Verify:**

```bash
npm run typecheck 2>&1 | grep -c ERROR
npx eslint . && npx vitest run 2>&1 | tail -4
```

Expected: **4 → 1** (only the `@smui/banner` ambient-const-enum error remains).

**Commit:** `fix(routes): narrow the optional name route param`

---

#### Task 4.8 — Resolve the SMUI ambient const enum error

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
npm run typecheck
npx eslint . && npx vitest run 2>&1 | tail -4
npm run build
```

Expected: **`svelte-check found 0 errors and 0 warnings`. This is the milestone — a clean typecheck for the first time.** Tests still **14 files / 152 tests**; build succeeds.

If disabling `verbatimModuleSyntax` surfaces new import-elision errors elsewhere, revert this task and instead exclude `node_modules/@smui/**` from the check; report which route you took and the resulting count.

**Commit:** `fix(ts): disable verbatimModuleSyntax to unblock smui const enums`

---

### Phase 5 — Characterization tests for the logic that is still untested

Both tests assert **current** behaviour, including behaviour that looks odd. Nothing here changes runtime code.

#### Task 5.1 — Characterize `alertTransactionAndFetchResult`

**Create:** `src/lib/transaction-alert.test.ts`

`src/lib/utils.ts:16-32` is the shared tail of all eight write-flow call sites and the only part of `utils.ts` coverage still reports uncovered (`utils.ts | 71.11 | ... | 17-32`). Pin it before Task 6.1 builds on it.

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

	it('falls back to a generic message when the rejection is not an Error', async () => {
		const intent = { transactionHash: 'hash-3', fetchResult: Promise.reject('nope') };

		await expect(alertTransactionAndFetchResult(intent as never)).resolves.toMatchObject({
			hasError: true,
			errorMessage: 'Something went wrong'
		});
		expect(get(alertMessage)).toBe('Something went wrong');
	});
});
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npx vitest run --coverage 2>&1 | grep "utils.ts"
```

Expected: **15 files / 155 tests passing**; `utils.ts` reaches 100 % statements.

**Commit:** `test(lib): characterize the transaction alert helper`

---

#### Task 5.2 — Extract and pin the `DomainsTable` sort comparator

**Create:** `src/lib/sort.ts`, `src/lib/sort.test.ts`

`src/routes/profile/DomainsTable.svelte:32-34` reads `[a[sort], b[sort]][sortDirection === 'ascending' ? 'slice' : 'reverse']()` — an unreadable way to conditionally swap two values, and completely untested (the file is at 0 % coverage). Write the test first; it documents today's semantics exactly, including that `'none'` sorts like `'descending'`.

Failing test first, `src/lib/sort.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { compareByKey } from './sort';

const rows = [
	{ tokenId: 3, name: 'c.meta' },
	{ tokenId: 1, name: 'a.meta' },
	{ tokenId: 2, name: 'b.meta' }
];

describe('compareByKey', () => {
	it('sorts numbers ascending', () => {
		const sorted = [...rows].sort(compareByKey('tokenId', 'ascending'));

		expect(sorted.map((row) => row.tokenId)).toEqual([1, 2, 3]);
	});

	it('sorts numbers descending', () => {
		const sorted = [...rows].sort(compareByKey('tokenId', 'descending'));

		expect(sorted.map((row) => row.tokenId)).toEqual([3, 2, 1]);
	});

	it('sorts strings with locale compare', () => {
		const sorted = [...rows].sort(compareByKey('name', 'ascending'));

		expect(sorted.map((row) => row.name)).toEqual(['a.meta', 'b.meta', 'c.meta']);
	});

	it('treats an unsorted column the same as descending, as the table does today', () => {
		const sorted = [...rows].sort(compareByKey('tokenId', 'none'));

		expect(sorted.map((row) => row.tokenId)).toEqual([3, 2, 1]);
	});
});
```

Run `npx vitest run` → **fails** (`./sort` does not exist). Then create `src/lib/sort.ts`:

```ts
export type SortDirection = 'ascending' | 'descending' | 'none';

export const compareByKey =
	<T>(key: keyof T, direction: SortDirection) =>
	(a: T, b: T) => {
		const sign = direction === 'ascending' ? 1 : -1;
		const [aVal, bVal] = [a[key], b[key]];

		if (typeof aVal === 'string' && typeof bVal === 'string')
			return sign * aVal.localeCompare(bVal);

		return sign * (Number(aVal) - Number(bVal));
	};
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint .
```

Expected: **16 files / 159 tests passing**; typecheck 0 errors. No call site changes yet.

**Commit:** `test(lib): extract and pin the domains table sort comparator`

---

### Phase 6 — Remove the duplication

#### Task 6.1 — Add `runTransaction`

**Create:** `src/lib/transaction.ts`, `src/lib/transaction.test.ts`

Failing test first:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runTransaction } from './transaction';

vi.mock('@sentry/sveltekit', () => ({ captureException: vi.fn() }));

describe('runTransaction', () => {
	beforeEach(() => {
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

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint .
```

Expected: **17 files / 161 tests passing**. No call site changes yet.

**Commit:** `feat(lib): add runTransaction helper`

---

#### Task 6.2 — Adopt `runTransaction` in the write flows that throw

**Modify:** `src/routes/register/[name]/+page.svelte`, `src/routes/register/[name]/SubdomainRegistration.svelte`, `src/routes/domain/[name]/renew/+page.svelte`, `src/components/DomainPayment.svelte`, `src/components/Records.svelte`

Five of the eight call sites use the identical `const { hasError } = await …; if (hasError) throw new Error(…)` shape. Replace each pair of lines with one call and swap the import.

`src/routes/register/[name]/+page.svelte:37-43` becomes:

```ts
await runTransaction(transactionIntent, 'Failed to register domain.');
alertMessage.set({
	message: 'Domain registered successfully!',
	action: { label: 'Go to profile', callback: () => goto('/profile') }
});
```

Apply the same shape at:

| File                                                      | Lines | Failure message                  | Keep after the call                                    |
| --------------------------------------------------------- | ----- | -------------------------------- | ------------------------------------------------------ |
| `src/routes/register/[name]/SubdomainRegistration.svelte` | 39-42 | `'Failed to register domain.'`   | `alertMessage.set('Domain registered successfully!');` |
| `src/routes/domain/[name]/renew/+page.svelte`             | 23-25 | `'Failed to renew domain.'`      | `alertMessage.set('Domain renewed successfully!');`    |
| `src/components/DomainPayment.svelte`                     | 85-87 | `'Failed to approve mint fees.'` | `feesApproved = true;`                                 |
| `src/components/Records.svelte`                           | 47-54 | `'Failed to create record.'`     | the four-line reset block                              |

In each file, replace `alertTransactionAndFetchResult` in the import with `runTransaction from '$lib/transaction'`, dropping `alertTransactionAndFetchResult` from the `$lib` / `src/lib` barrel import if nothing else in the file uses it.

> `src/components/Record.svelte:42,49` and `src/routes/domain/[name]/transfer/+page.svelte:40` use a **different** shape — they `alertMessage.set(...)` or branch on `!hasError` instead of throwing. **Leave them alone**; forcing them into `runTransaction` would change what the user sees.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint . && npm run build
grep -rn "alertTransactionAndFetchResult" src/routes src/components   # only Record.svelte and transfer/+page.svelte
npm run test:integration
```

Expected: tests still **17 files / 161 tests**; typecheck 0 errors; the Playwright register/renew/records specs still pass (these are the only automated proof of this refactor — do not skip them).

**Commit:** `refactor(flows): use runTransaction for the throw-on-error write flows`

---

#### Task 6.3 — Collapse the two identical page loaders

**Create:** `src/lib/loaders.ts`, `src/lib/loaders.test.ts` · **Modify:** `src/routes/domain/[name]/renew/+page.ts`, `src/routes/domain/[name]/transfer/+page.ts`

`diff src/routes/domain/\[name\]/renew/+page.ts src/routes/domain/\[name\]/transfer/+page.ts` reports nothing — they are byte-identical 11-line files, and both are at 0 % coverage.

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

Both `+page.ts` files become, in full:

```ts
import { analyzeDomain } from '$lib/loaders';

export function load({ params: { name } }) {
	return analyzeDomain(name);
}
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint . && npm run build
npm run test:integration -- tests/e2e/domain-renewal.spec.ts tests/e2e/domain-transfer.spec.ts
```

Expected: **18 files / 163 tests passing**; typecheck 0 errors; both e2e specs green.

**Commit:** `refactor(routes): share the domain analysis page loader`

---

#### Task 6.4 — Adopt `compareByKey` in `DomainsTable`

**Modify:** `src/routes/profile/DomainsTable.svelte`

Swap the inline trick for the comparator pinned in Task 5.2. Keep the in-place `.sort()` + `domains = domains;` reassignment exactly as it is — changing it to a copy would alter how the `$: if (domainsLength > 0) handleSort();` reactive statement re-triggers.

Replace `:30-39`:

```ts
function handleSort() {
	domains.sort(compareByKey(sort, sortDirection));
	domains = domains;
}
```

Add to the imports:

```ts
import { compareByKey } from '$lib/sort';
```

`sortDirection` is `Lowercase<keyof typeof SortValue>` = `'ascending' | 'descending' | 'none'`, which matches `SortDirection` exactly.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint . && npm run build
npm run test:integration -- tests/e2e/profile.spec.ts
```

Expected: 18 files / 163 tests; typecheck 0 errors. Manually: connect a wallet with ≥ 2 domains, click both column headers, confirm ascending and descending both still work.

**Commit:** `refactor(profile): replace the sort trick with the tested comparator`

---

### Phase 7 — Fix the bugs the tests now make safe to touch

#### Task 7.1 — Restore the full domain list when the profile search is cleared

**Create:** `src/lib/filter.test.ts`, `src/lib/filter.ts` · **Modify:** `src/routes/profile/+page.svelte`

`src/routes/profile/+page.svelte:18-20` guards the reactive filter on `search !== ''`, so deleting the text with the keyboard leaves `domainsFiltered` stuck on the last query — only the ✕ button restores it, via `cleanSearch`. `isFuzzyMatch:36-43` also ends in a dead `else false;` (returning `undefined`), and its `startsWith` branch is fully subsumed by `includes`.

This task fixes a bug, so the test documents the **desired** behaviour. Write it first, `src/lib/filter.test.ts`:

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

In `src/routes/profile/+page.svelte`: delete `isFuzzyMatch` (`:36-43`), replace the guarded block at `:18-20` with

```ts
$: domainsFiltered = filterDomainsByName(domains, search);
```

reduce `cleanSearch` (`:31-34`) to just `search = '';`, drop the `domainsFiltered = domains;` line inside the wallet subscription (`:27`), and add `import { filterDomainsByName } from '$lib/filter';`. `let domainsFiltered: Domain[] = [];` (`:14`) stays as the reactive statement's target.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint .
npm run test:integration -- tests/e2e/profile.spec.ts
```

Expected: **19 files / 167 tests passing**. Manually: type into the profile search, then delete the text with backspace — the full list must come back (it previously stayed filtered).

**Commit:** `fix(profile): restore the full domain list when the search is cleared`

---

#### Task 7.2 — Stop the `refresh` subscription outliving the domain page

**Modify:** `src/routes/domain/[name]/+page.svelte`

`refresh.subscribe` at `:19` is never torn down, so after navigating away a record deletion still re-loads the old domain and can `goto()` the user to a stale register page.

Replace `:19-25` with a subscription owned by the component lifecycle. Keep it in its **own, synchronous** `onMount` — Svelte does not treat an `async` callback's return value as a teardown, and the existing `onMount` at `:36` is async:

```ts
onMount(() =>
	refresh.subscribe((val) => {
		if (!val) return;

		domain.set(undefined);
		loadDomain();
		refresh.set(false);
	})
);
```

`onMount` is already imported (`:5`). The initial synchronous callback fires with `false` and returns immediately, exactly as today.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint .
npm run test:integration -- tests/e2e/dns-records.spec.ts tests/e2e/domain-management.spec.ts
```

Expected: 19 files / 167 tests; both e2e specs green. Manually: open a domain you own, delete a record, navigate home — no unexpected navigation.

**Commit:** `fix(domain): unsubscribe from the refresh store on destroy`

---

#### Task 7.3 — Own the profile wallet subscription

**Modify:** `src/routes/profile/+page.svelte`

Same leak at `:22`.

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

Add `import { onMount } from 'svelte';`.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint .
npm run test:integration -- tests/e2e/profile.spec.ts
```

Expected: 19 files / 167 tests. Manually: connect a wallet, visit `/profile`, navigate away and back — domains still load, once.

**Commit:** `fix(profile): unsubscribe from the wallet store on destroy`

---

#### Task 7.4 — Make `Icon` props reactive

**Modify:** `src/components/Icon.svelte`

`const icon = \`ic:baseline-${key}\`` (`:7`) and the `alignClass` block (`:12-17`) run once at init, so an `icon`or`align` prop that changes later is ignored.

Delete `:7` and `:12-17` and replace with:

```ts
$: icon = `ic:baseline-${key}`;
$: alignClass = align === 'right' ? 'align-icon-right' : align === 'left' ? 'align-icon-left' : '';
```

> Leave the three-branch `<Icon>` rendering in `src/components/Chip.svelte:39-43` in place — collapsing it is a separate, optional change, and this task's contract is "no visible difference".

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint . && npm run build
npm run test:integration
```

Expected: 19 files / 167 tests; full e2e suite green. Manually: click a copy-type `Chip` — the icon must still swap to ✓ and back after 1 s.

**Commit:** `fix(icon): make the icon and align props reactive`

---

#### Task 7.5 — Stop unset env vars becoming the string `"undefined"`

**Create:** `src/lib/env.test.ts`, `src/lib/env.ts` · **Modify:** `src/lib/config.ts`

`src/lib/config.ts:23-24` does `` `${import.meta.env.VITE_LANDING_URL}` ``. With the var unset this yields the literal `"undefined"`, which is rendered as the footer landing link (`src/routes/Footer.svelte:12`), the sitemap URL (`src/routes/sitemap.xml/+server.js:16`) and inside `robots.txt` (`src/routes/robots.txt/+server.js:9`).

Failing test first, `src/lib/env.test.ts`:

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

In `src/lib/config.ts`, add `import { optionalEnv } from './env';` and replace `:23-24`:

```ts
const landingUrl = optionalEnv(import.meta.env.VITE_LANDING_URL, 'https://metanames.app');
const websiteUrl = optionalEnv(import.meta.env.VITE_WEBSITE_URL, 'https://app.metanames.app/');
```

> Keep the trailing slash on `websiteUrl` — `src/routes/robots.txt/+server.js:9` and `src/routes/sitemap.xml/+server.js:16` concatenate directly onto it.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npm run typecheck && npx eslint . && npm run build
```

Expected: **20 files / 171 tests passing**. Manually: `npm run dev` with no `.env`, load `/robots.txt` — the `Sitemap:` line must be a real URL, not `undefinedsitemap.xml`.

**Commit:** `fix(config): fall back instead of rendering "undefined" for unset env vars`

---

#### Task 7.6 — Document the env contract

**Create:** `.env.example`

There is no `.env.example`, so the required env contract is undocumented. `.gitignore` already has `!.env.example`, so the file will be tracked.

```
# Deployment environment: "test" (default) or "prod"
VITE_ENV=test

# Public marketing site linked from the footer
VITE_LANDING_URL=https://metanames.app

# Canonical app URL used in robots.txt and sitemap.xml (keep the trailing slash)
VITE_WEBSITE_URL=https://app.metanames.app/

# Set to "true" to show the "contract temporarily disabled" banner
VITE_CONTRACT_DISABLED=false
```

**Verify:**

```bash
git check-ignore -v .env.example   # no match, exit 1
git status --short .env.example    # shows as untracked, ready to add
grep -rn "import.meta.env.VITE_" src/   # every VITE_ var used is listed above
```

**Commit:** `docs: document the required environment variables`

---

### Phase 8 — Cleanup

#### Task 8.1 — Drop the unused devDependencies

**Modify:** `package.json`, `package-lock.json`

`@types/siema` has zero references (`grep -rn 'siema' src/ vite.config.ts svelte.config.js` → nothing). `jsdom@29` was added by `#187` but is never used: `vite.config.ts:21-23` sets no `environment`, and no test file has a `@vitest-environment` pragma (`grep -rn "jsdom" src/ tests/ vite.config.ts` → nothing). All 152+ tests run in the default node environment.

```bash
npm uninstall --legacy-peer-deps @types/siema jsdom
```

**Verify:**

```bash
npm run build && npm run typecheck && npx vitest run 2>&1 | tail -4
```

Expected: 20 files / 171 tests; build and typecheck clean.

**Commit:** `chore(deps): remove unused siema types and jsdom`

---

#### Task 8.2 — Merge the duplicate journal directories

**Modify:** `.jules/palette.md` · **Delete:** `.Jules/`

Both `.jules/` and `.Jules/` exist and both contain a `palette.md`; on a case-insensitive filesystem they collide. Merge any unique content from `.Jules/palette.md` into `.jules/palette.md`, then:

```bash
git rm -r .Jules
```

**Verify:**

```bash
ls -d .jules .Jules 2>&1   # only .jules
npm run lint
```

**Commit:** `chore: merge the duplicate agent journal directories`

---

#### Task 8.3 — Unify import specifiers on `$lib`

**Modify:** the files importing from `src/lib/…`

23 imports use `from 'src/lib/…'` and 37 use `from '$lib/…'`, sometimes both in the same file (`src/components/DomainPayment.svelte:3` vs `:7,18,19`). `$lib` is the SvelteKit convention and is already aliased in `svelte.config.js:16-18`.

Do this **one directory at a time**, running the verify block after each, so a bad rewrite is easy to bisect:

```bash
grep -rln "from 'src/lib" src/components
grep -rln "from 'src/lib" src/routes
```

Rewrite only the `src/lib/x` → `$lib/x` specifiers. Leave `from 'src/components/…'` and `from 'src/routes/…'` alone — those resolve via the `src/*` alias and have no `$`-prefixed equivalent.

**Verify after each directory:**

```bash
npm run typecheck && npx eslint . && npx vitest run 2>&1 | tail -4 && npm run build
```

Expected after the last directory: `grep -rc "from 'src/lib" src/ | grep -v ':0'` → no output.

**Commit (one per directory):** `chore(imports): use $lib specifiers in <dir>`

---

#### Task 8.4 — Move the Sentry DSN into config

**Modify:** `src/lib/config.ts`, `src/hooks.client.ts`, `src/hooks.server.ts`, `.env.example`

The same DSN is hardcoded twice (`src/hooks.client.ts:5`, `src/hooks.server.ts:6`), both with `tracesSampleRate: 1.0` in production.

In `src/lib/config.ts` add to the `Config` type and the exported object:

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

**Verify:**

```bash
npm run typecheck && npx eslint . && npx vitest run 2>&1 | tail -4 && npm run build
```

> Keeping the existing DSN as the fallback preserves current behaviour exactly; the sample-rate drop to 0.1 in production is the one intentional change — call it out in the commit body.

**Commit:** `refactor(sentry): read the dsn from config and sample prod traces at 10%`

---

#### Task 8.5 — Extract the account-balance GraphQL query

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

`src/lib/wallet.ts:25-29` becomes:

```ts
const body = { query: accountCoinsQuery, variables: { address } };
```

with `import { accountCoinsQuery } from './queries';`.

**Verify:**

```bash
npm run typecheck && npx eslint . && npx vitest run 2>&1 | tail -4 && npm run build
```

The two `getAccountBalance` tests in `src/lib/wallet.test.ts:100-138` must still pass. Manually: connect a wallet, open a register page, click **Approve fees** — an insufficient-balance case must still produce the "Add funds" alert, which proves the query still returns `displayCoins`.

**Commit:** `refactor(wallet): extract the account coins graphql document`

---

#### Task 8.6 — (Optional, coverage-gated) Consolidate the duplicated SDK suites

**Delete:** `src/lib/dns-records.test.ts` — **only if** the coverage check below holds

`src/lib/sdk.test.ts` (24 tests) and `src/lib/dns-records.test.ts` (28 tests after Task 2.4) both test the same five exports of `src/lib/sdk.ts` — `getRecordClassFrom`, `metaNamesSdkFactory`, `socialRecords`, `profileRecords`, `getValidator` — with different mocks.

First record the current number:

```bash
npx vitest run --coverage 2>&1 | grep " sdk.ts"
```

Then delete `src/lib/dns-records.test.ts` and re-run the same command.

- If `src/lib/sdk.ts` coverage is **unchanged**, keep the deletion.
- If it **drops**, restore the file, move only the missing cases into `src/lib/sdk.test.ts`, and delete `dns-records.test.ts` afterwards.

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npx vitest run --coverage 2>&1 | grep " sdk.ts"
```

Expected if kept: **19 files / 143 tests passing**, `src/lib/sdk.ts` coverage unchanged.

**Commit:** `test(sdk): consolidate the duplicated sdk test suites`

---

#### Task 8.7 — Enforce the repaired gates in CI

**Modify:** `.github/workflows/ci.yml`

The gates are only worth repairing if CI holds them. Today the workflow runs unit + integration tests, never lint or typecheck, and its triggers are `[main, integration-tests]` — `staging` is not covered.

Change both trigger lists to `[main, staging]` and add a job before `unit-tests`:

```yaml
quality-gates:
  name: Lint and Typecheck
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci --legacy-peer-deps

    - name: Lint
      run: npm run lint

    - name: Typecheck
      run: npm run typecheck
```

Leave the existing `unit-tests` and `integration-tests` jobs as they are.

**Verify:** run the same commands the job runs, locally:

```bash
npm ci --legacy-peer-deps
npm run lint
npm run typecheck
```

Both must exit 0 before this is committed — otherwise CI turns red on merge.

**Commit:** `ci: enforce lint and typecheck, and run on staging`

---

## FINAL VERIFICATION

Run from a clean checkout. All five must pass.

```bash
npm ci --legacy-peer-deps
npm run lint
npm run typecheck
npm run test:unit
npm run test:coverage
npm run build
npm run test:integration
```

| Command                    | Expected after this plan                                                                                                                                | Measured `staging` baseline                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`             | `All matched files use Prettier code style!`, then ESLint exits 0 with no output.                                                                       | Prettier failed on **27 files**; ESLint exited **2** — no flat config found, zero files linted.                                        |
| `npm run typecheck`        | `svelte-check found 0 errors and 0 warnings`.                                                                                                           | **16 errors, 0 warnings, 9 files.**                                                                                                    |
| `npm run test:unit`        | **20 files / 171 tests**, all passing, process exits. (**19 files / 143 tests** if optional Task 8.6 is taken.)                                         | **14 files / 175 tests**, passing, but `test:unit` was watch mode; 23 of those tests (`types.test.ts`) asserted nothing about the app. |
| `npm run test:coverage`    | `src/lib` **≥ 85 % stmts** (record the real number). `utils.ts`, `error.ts`, `sort.ts`, `filter.ts`, `env.ts`, `transaction.ts`, `loaders.ts` at 100 %. | All files **10.42 %**; `src/lib` **73.29 % stmts / 78.57 % branch**; `error.ts`, `types.ts`, `server/config.ts` at **0 %**.            |
| `npm run build`            | Succeeds.                                                                                                                                               | Succeeds.                                                                                                                              |
| `npm run test:integration` | All 13 spec files pass (needs a dev server and `TESTNET_PRIVATE_KEY`).                                                                                  | Not run in this audit — treat the first green run after Task 6.2 as the baseline and record it.                                        |

Also confirm the structural claims hold:

```bash
ls eslint.config.js                              # exists
ls .eslintrc.cjs .eslintignore 2>&1              # both gone
grep -rn "tldMigrationProposal\|PROPOSALS_WALLET" src/ tests/   # no output
grep -rc "from 'src/lib" src/ | grep -v ':0'     # no output
diff src/routes/domain/\[name\]/renew/+page.ts src/routes/domain/\[name\]/transfer/+page.ts  # identical, 4 lines each
ls -d .Jules 2>&1                                # gone
ls .env.example                                  # exists
```

Manual smoke checklist on testnet before deploying — these all have Playwright coverage now, but the wallet-provider matrix does not:

- [ ] Search a name on `/` → available names route to `/register/<name>`, taken names to `/domain/<name>`
- [ ] Register a domain end to end (approve fees → pay → land on the domain page)
- [ ] Renew a domain
- [ ] Transfer a domain
- [ ] Add, edit and delete a record on a domain you own
- [ ] Profile: type in the search box, clear it with backspace, sort both columns
- [ ] Connect and disconnect each of MetaMask, Partisia Wallet and Ledger

---

## Deliberately out of scope

- **Anything proposal- or voter-related** (owner decision). Task 4.3 only deletes the orphaned constants left behind by `#190`; it does not reconcile the two mainnet addresses, restore any endpoint, or add auth.
- A `src/lib/services/domain.ts` SDK-wrapping layer — the flows it would cover are already covered end-to-end.
- A jsdom / `@testing-library/svelte` component-test harness — duplicated by the Playwright suite.
- Rewriting `Domain.svelte` / `+layout.svelte` layouts, Svelte 5 migration, replacing SMUI, adding a state-management library, touching the SDK.
- `'TEST_COIN'` hardcoded at `src/routes/register/[name]/SubdomainRegistration.svelte:37` — flagged in the original audit, but it is the correct symbol for the free-subdomain path on both networks and there is no evidence of a bug. Raise separately if that changes.
- The `alertTransaction` / `alertMessage` subscriptions at `src/routes/+layout.svelte:40,47` — the same leak as Tasks 7.2/7.3, but the root layout is never destroyed, so there is nothing to fix.
