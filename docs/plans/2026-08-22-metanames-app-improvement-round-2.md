# MetaNames App Improvement Plan — Round 2

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Close the correctness, observability, tooling and dependency gaps that round 1's refactor left behind, without touching the Svelte 4 → 5 question.

**Architecture:** A SvelteKit 2 SPA-with-SSR on Vercel. Route components in `src/routes` and shared components in `src/components` talk to the Partisia chain through a single `@metanames/sdk` instance held in the `src/lib/stores/sdk.ts` writable; a handful of `+server.ts` endpoints under `src/routes/api` do the same server-side through `src/lib/server/index.ts`. Pure, testable logic lives in `src/lib/*.ts` (Vitest); everything that needs a browser and a chain is driven by Playwright against testnet.

**Tech Stack:** SvelteKit 2.55 · Svelte 4.2 · TypeScript 5.9 (strict) · SMUI 7 · `@metanames/sdk` 6.3 · Vite 5.4 · Vitest 2.1 + `@vitest/coverage-v8` · Playwright 1.58 · ESLint 9 flat config · Prettier 3 · Sentry 8 · `@sveltejs/adapter-vercel`.

---

## AUDIT SUMMARY

### Structure snapshot

```
src/  25 .svelte · 28 .ts (non-test) · 3 342 LOC
  components/   Chip, ConnectionRequired, Domain, DomainPayment, GoBackButton,
                Icon, LoadingButton, Record, Records
  lib/          api, config, env, error, filter, loaders, queries, sdk, sort,
                transaction, types, url, utils, wallet  (+ 21 *.test.ts)
  lib/server/   index.ts        (SDK singleton, handleError, getStats, getRecentDomains)
  lib/stores/   main.ts, sdk.ts
  routes/       /, /domain/[name], /domain/[name]/{renew,transfer}, /profile,
                /register/[name], /tld, 5 × api/**/+server.ts, robots.txt, sitemap.xml
tests/  12 spec files (10 e2e + 2 api)
```

Largest files — `src/lib/domain-transfer.test.ts` 348, `src/routes/WalletConnectButton.svelte` 289,
`src/components/DomainPayment.svelte` 231, `src/components/Domain.svelte` 227,
`src/routes/+layout.svelte` 206, `src/routes/DomainSearch.svelte` 182. Nothing is oversized;
round 1's extractions (`runTransaction`, `compareByKey`, `filterDomainsByName`, `analyzeDomain`,
the shared `+page.ts` loader) held. **No new duplication or god-component was found.**

### Gate state (re-verified on `staging`, 2026-08-22)

| Gate                                   | Command                                             | Result                                                       |
| -------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| Typecheck                              | `npx svelte-check --tsconfig ./tsconfig.json`       | **0 errors, 0 warnings**                                     |
| Lint                                   | `npx eslint .`                                      | **0 findings** (exit 0)                                      |
| Format                                 | `npx prettier --plugin prettier-plugin-svelte -c .` | **All matched files clean**                                  |
| Unit                                   | `npx vitest run`                                    | **162 passed / 21 files**                                    |
| E2E                                    | `npx playwright test`                               | 54 passed + 2 flaky (owned by another worker — not in scope) |
| Coverage (unscoped)                    | `npx vitest run --coverage`                         | 14.09 % "all files" / 88.08 % `src/lib`                      |
| Coverage (scoped to `src/lib/**/*.ts`) | see Task 1.1                                        | 91.87 stmts / 95.50 branch / 92.85 funcs                     |
| Production build                       | `npx vite build`                                    | ✔ 27.8 s; 3.68 MB client JS (47 files) + 362 kB CSS          |

### Findings, ordered by impact

#### F1 — `/register/[name]` reads its route param once, so the parent redirect leaves the wrong domain on screen · **HIGH, correctness**

`src/routes/register/[name]/+page.svelte:22` captures `const nameParam = $page.params.name ?? ''`
and does _all_ of its work inside `onMount` (`:52-82`). SvelteKit reuses a page component when only
the route param changes, so `onMount` never re-runs. Two call sites redirect within this same route:

- `src/routes/register/[name]/+page.svelte:80` — `goto('/register/' + parentDomainName, { replaceState: true })` when the parent is not registered
- `src/routes/register/[name]/SubdomainRegistration.svelte:26` — `goto('/register/' + parentDomainName)` when the parent lookup comes back empty

After either redirect the URL says `/register/<parent>` while `$analyzed` still holds the child, so
`src/routes/register/[name]/+page.svelte:97` renders `<DomainPayment domainName="sub.parent" …>` —
the checkout offers to register a name the user is no longer looking at. Round 1 fixed exactly this
class of bug for `/domain/[name]` (commit `350ed47`, see the comment at
`src/routes/domain/[name]/+page.svelte:18-20`) but left `/register/[name]` on the old pattern.

#### F2 — Read failures leave permanent spinners and unreported rejections · **HIGH, UX + observability**

Round 1 hardened the **write** path only: `runTransaction` (`src/lib/transaction.ts:4-12`),
`alertTransactionAndFetchResult` (`src/lib/utils.ts:16-32`) and `LoadingButton`'s default `onError`
(`src/components/LoadingButton.svelte:12-20`) all capture to Sentry and surface a snackbar. The
**read** path has no equivalent — four call sites set a loading flag, `await` an SDK read, and have
no `catch`:

| Site                                                         | On rejection                                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/DomainSearch.svelte:45-52`                       | `isLoading` stays `true` → spinner forever; called from a `setTimeout` (`:28`) so the rejection is unhandled and untraceable    |
| `src/routes/profile/+page.svelte:30-36`                      | `loaded` stays `false` → `DomainsTable.svelte:145` `LinearProgress` spins forever; rejection escapes a store-subscribe callback |
| `src/routes/domain/[name]/+page.svelte:47-50`                | `domain` stays `undefined` → `:67` `CircularProgress` forever                                                                   |
| `src/routes/register/[name]/SubdomainRegistration.svelte:24` | unhandled rejection inside `onMount`; the `!parentDomain` branch at `:26` cannot tell "absent" from "lookup failed"             |

#### F3 — Coverage is measured but ungoverned, and one test suite is tautological · **HIGH, tooling**

`vite.config.ts:24-26` declares `test.include` but **no `coverage` block**. Vitest 2 defaults
`coverage.all` to true, so v8 instruments `playwright.config.ts`, `svelte.config.js` and all 25
`.svelte` files that no Vitest test can reach. The headline number is therefore **14.09 %** while
`src/lib` actually sits at **88.08 %** — a number nobody can act on, and with no `thresholds` it can
regress silently.

Underneath it, `src/lib/wallet.test.ts:38-51` declares `describe('connectPartisia')` but **never
imports `connectPartisia`** — it rebuilds `if (!mockSdk.connection) throw` inline and asserts against
itself. This is precisely the tautology round 1 stripped out of `types.test.ts`. Coverage confirms
the hole: `src/lib/wallet.ts` is at **56 % statements**, uncovered lines `13-25` (`connectPartisia`)
and `42-56` (`connectMetaMask`).

#### F4 — Five dependencies with zero references, one of them the only `dependencies` entry in `npm audit` · **MEDIUM**

`grep -rF` across `src`, `tests`, `vite.config.ts` and `svelte.config.js` finds **no** reference to:

| Package                             | Where declared           |
| ----------------------------------- | ------------------------ |
| `chart.js`                          | `package.json:83` (deps) |
| `svelte-chartjs`                    | `package.json:87` (deps) |
| `@secata-public/bitmanipulation-ts` | `package.json:79` (deps) |
| `@smui/radio`                       | `package.json:42` (dev)  |
| `@smui/form-field`                  | `package.json:35` (dev)  |

`svelte-chartjs@3.1.5` is additionally the reason `npm audit` reports
`svelte-chartjs → Depends on vulnerable versions of svelte` against a **runtime** dependency;
dropping it removes that entry without touching Svelte itself.

#### F5 — Every build compiles a 382 kB light theme nothing imports · **MEDIUM, build time**

`package.json:6-8` — `generate:themes` runs `smui-theme-light` **and** `smui-theme-dark`, and
`build` runs `generate:themes`. But `src/styles/app.scss:3` imports only `./theme/smui-dark.css`;
`grep -rn "smui.css" src` returns nothing. `src/styles/theme/smui.css` is **382 161 bytes** of dead
Sass output regenerated on every `npm run build` and every CI integration run. (It is not shipped —
it is never imported — so this costs build time, not bundle size. Both files are gitignored:
`.gitignore:15-16`.)

#### F6 — No security response headers, no CSP · **MEDIUM, security**

`src/hooks.server.ts:17` is `sequence(sentryHandle())` and nothing else; `svelte.config.js` sets no
`kit.csp`. The app renders attacker-influenced content in two places — `{@html domainAvatar}` at
`src/components/Domain.svelte:50` (a jdenticon hash, safe by construction) and clickable `Uri`
records at `src/components/Domain.svelte:81-87`, whose scheme is already checked by
`src/lib/utils.ts:37-45` (round 1). Three static response headers are cheap, testable and would raise
the floor; a full CSP is not (see _considered but rejected_).

#### F7 — `/profile` is the only route without a document title · **LOW-MEDIUM, a11y**

`src/routes/profile/+page.svelte` has no `<svelte:head>`. Every other page sets one:
`src/routes/+page.svelte:5-7`, `domain/[name]/+page.svelte:61-63`,
`domain/[name]/renew/+page.svelte:43-45`, `domain/[name]/transfer/+page.svelte:53-55`,
`register/[name]/+page.svelte:85-87`, `tld/+page.svelte:22-24`. A missing title is a WCAG 2.4.2
failure and leaves the browser tab showing the raw URL. This is the only a11y gap that survived
round 1's sweep — all 26 icon buttons and images carry `aria-label`/`alt`, and svelte-check reports
zero a11y warnings.

#### F8 — CI installs three different ways and hides flakiness · **MEDIUM, CI signal**

`.github/workflows/ci.yml` — `:20` `npm ci --legacy-peer-deps`, `:41` `npm ci`, `:62`
`NODE_ENV=development npm ci`. Either the peer-dep flag is genuinely required (commit `3817e92`
added it for that reason) and the `unit-tests` job is one transitive bump away from breaking, or it
is not and `quality-gates` is masking a resolvable tree. `NODE_ENV=development` is a no-op on a
GitHub runner, where `NODE_ENV` is unset. Separately, coverage is never run in CI, so F3's
thresholds would have no enforcement point.

### Considered but rejected

| Candidate                                                                                                                                     | Why not                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Svelte 5 upgrade** (`origin/dependabot/…/svelte-5.53.5`, `svelte-5.55.7`)                                                                   | **Explicitly out of scope.** Round 1 listed "Svelte 5 migration" under _Deliberately out of scope_, and nothing has changed that. It would force SMUI 7→9 across all 22 `@smui/*` packages, `@sveltejs/vite-plugin-svelte` 3→7, `eslint-plugin-svelte` 2→3, `prettier-plugin-svelte` 3→4, `smui-theme` 7→9, plus a runes migration across 25 components. The advisory it would close (SSR XSS via spread attributes) needs an untrusted object spread onto an element; the app's only spread is `{...$$restProps}` at `src/components/Icon.svelte:18`, all developer-supplied. Task 4.1 removes `svelte-chartjs`, which is the only _runtime_ package pointing at the vulnerable range. |
| **Any other dependency bump** (Vite 6/8, ESLint 10, TypeScript 7, Sentry 10, adapter-vercel 6, `@iconify/svelte` 5, `globals` 17, `vitest` 4) | `npm outdated` shows **every** installed package already at its `Wanted` version — there are no in-range patch or minor bumps left to take. All 42 remaining entries are majors, and each is coupled to either the Svelte 5 decision or a SvelteKit version bump. Not round-2 work.                                                                                                                                                                                                                                                                                                                                                                                                     |
| **`npm audit fix`**                                                                                                                           | 67 findings, of which the auto-fixable ones (`tar`, `picomatch`, `yaml`, `flatted`, `follow-redirects`, `form-data`) are all transitive **build-tooling** deps reachable from `smui-theme`/`@sentry/cli`/`chokidar`, not from shipped code. Running it churns a 383 kB lockfile for no change in what the browser downloads. The one entry that touches `dependencies` is handled by Task 4.1.                                                                                                                                                                                                                                                                                          |
| **Splitting the 1.26 MB SDK chunk out of the initial bundle**                                                                                 | Real and measured: `.svelte-kit/output/client/_app/immutable/entry/app.*.js` imports the chunk carrying `@metanames/sdk` + `axios` + the Partisia crypto stack (1 264 kB), and total client JS is 3 684 kB across 47 files. But `src/lib/stores/sdk.ts:5` constructs the SDK at module load and `:7,:11` read `config.byoc` **synchronously** to seed `selectedCoin`, and every route reads `$metaNamesSdk` synchronously in its markup. Making that lazy touches all 9 route nodes with no component-test harness to catch regressions — a round-3 project, not a bite-sized task. Baseline recorded here so it can be measured against later.                                         |
| **Purging the 362 kB SMUI stylesheet** (`_app/immutable/assets/0.*.css`)                                                                      | It is SMUI's compiled Material CSS for the whole component set. Purging needs a PurgeCSS pass over class names MDC composes at runtime — high risk of stripping live classes for a one-off gain, with no way to prove safety from the current gates.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **jsdom + `@testing-library/svelte` component harness**                                                                                       | Round 1 rejected this as duplicated by the Playwright suite; still true. The component fixes here are covered by extracting logic into `src/lib` (unit-tested) plus targeted Playwright assertions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **A full `kit.csp` policy**                                                                                                                   | SMUI emits inline `style` attributes, `@sentry/sveltekit` and `@vercel/{analytics,speed-insights}` add runtime origins, and a wrong policy silently breaks production styling with no gate that would catch it. Task 3.8 takes the three headers that are safe to assert instead. Revisit with a `report-only` rollout once there is a report sink.                                                                                                                                                                                                                                                                                                                                     |
| **Rewriting `TESTING_PLAN.md`**                                                                                                               | It is a requirements/feature inventory, still accurate. Leave it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Deleting the untracked `pnpm-lock.yaml` / `pnpm-workspace.yaml`**                                                                           | They are someone's working-tree artifacts and were not part of the request. Task 4.3 only stops them being committed by accident next to `package-lock.json`; it deletes nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **`'TEST_COIN'` at `SubdomainRegistration.svelte:37`**                                                                                        | Round 1 examined this and left it: it is the correct symbol for the free-subdomain path on both networks. Unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

---

## TASKS

**Conventions for every task.** Tabs, single quotes, no trailing commas, 100-char print width
(`.prettierrc`). Use **npm**, not yarn or pnpm. Run `npm run format` before committing if Prettier
complains. **Never commit red:** `npx vitest run` must be green after every task. Do not touch
`tests/e2e/helpers.ts` or `tests/e2e/dev-wallet.spec.ts` — another worker owns those.

Baseline: **162 unit tests passing**. The running total is stated per task.

---

### Phase 1 — Coverage and tooling

#### Task 1.1 — Scope coverage to what the unit suite can reach, and put a floor under it

**Modify:** `vite.config.ts`

Replace the `test` block at `vite.config.ts:24-26` with:

```ts
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'v8',
			// Vitest instruments everything by default, which pulled `playwright.config.ts`,
			// `svelte.config.js` and all 25 `.svelte` files — none of which a Vitest test can
			// reach — into the report. That reported 14.09 % while `src/lib` was at 88 %.
			// Components are covered by the Playwright suite instead.
			include: ['src/lib/**/*.ts'],
			exclude: ['src/lib/**/*.{test,spec}.ts', 'src/lib/index.ts'],
			reporter: ['text', 'lcov'],
			thresholds: {
				statements: 90,
				branches: 90,
				functions: 90,
				lines: 90
			}
		}
	}
```

**Verify:**

```bash
npx vitest run --coverage 2>&1 | tail -25
```

Expected: `162 passed`, exit code 0, and an `All files` row reading
**91.87 stmts / 95.5 branch / 92.85 funcs / 91.87 lines** over exactly `lib`, `lib/server` and
`lib/stores`. No `.svelte` or `*.config.*` rows. The only sub-90 file is `wallet.ts` at 56 %
(lines `13-25`, `42-56`) — Task 2.1 closes it.

**Commit:** `chore(test): scope coverage to src/lib and add thresholds`

---

#### Task 1.2 — Make CI install one way and actually enforce the coverage floor

**Modify:** `.github/workflows/ci.yml`

Three jobs install three different ways. Make all three use the incantation commit `3817e92`
established as necessary, and swap the unit job onto the coverage script so Task 1.1's thresholds
have an enforcement point.

- `.github/workflows/ci.yml:41` — change `run: npm ci` to `run: npm ci --legacy-peer-deps`
- `.github/workflows/ci.yml:62` — change `run: NODE_ENV=development npm ci` to `run: npm ci --legacy-peer-deps` (`NODE_ENV` is unset on a GitHub runner, so the prefix was a no-op)
- `.github/workflows/ci.yml:44` — change the unit-test step to:

```yaml
- name: Run unit tests with coverage
  run: npm run test:coverage
```

**Verify:**

```bash
npx yamllint .github/workflows/ci.yml 2>/dev/null || python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml')); print('yaml ok')"
grep -c 'npm ci --legacy-peer-deps' .github/workflows/ci.yml
npm run test:coverage 2>&1 | tail -5
```

Expected: `yaml ok`, the grep prints **3**, and `test:coverage` exits 0.

**Commit:** `ci: install identically in every job and gate on coverage`

---

### Phase 2 — Characterization tests for untested logic

#### Task 2.1 — Replace the tautological `connectPartisia` test and cover `connectMetaMask`

**Test:** `src/lib/wallet.test.ts`

`src/lib/wallet.test.ts:38-52` never imports the function it claims to test. Delete that whole
`describe('connectPartisia')` block and insert the two blocks below in its place (keep the file's
existing top-level `vi.mock` calls for `$lib/config`, `$lib/url` and
`partisia-blockchain-applications-sdk`, and keep the `getAddress` / `getAccountBalance` blocks
untouched). Add `afterEach` to the import on line 1.

```ts
describe('connectPartisia', () => {
	it('connects with the configured chain and returns the client', async () => {
		const connect = vi.fn().mockResolvedValue(undefined);
		vi.resetModules();
		vi.doMock('partisia-blockchain-applications-sdk', () => ({
			default: vi.fn().mockImplementation(() => ({
				connect,
				connection: { account: { address: '0xabcd1234' } }
			}))
		}));

		const { connectPartisia } = await import('$lib/wallet');
		const client = await connectPartisia();

		expect(connect).toHaveBeenCalledWith({
			chainId: 'Partisia Blockchain Testnet',
			permissions: ['sign'],
			dappName: 'Meta Names'
		});
		expect(client.connection).toEqual({ account: { address: '0xabcd1234' } });
	});

	it('throws when the wallet hands back no connection', async () => {
		vi.resetModules();
		vi.doMock('partisia-blockchain-applications-sdk', () => ({
			default: vi.fn().mockImplementation(() => ({
				connect: vi.fn().mockResolvedValue(undefined),
				connection: null
			}))
		}));

		const { connectPartisia } = await import('$lib/wallet');

		await expect(connectPartisia()).rejects.toThrow('Connection failed');
	});
});

describe('connectMetaMask', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('throws when MetaMask is not installed', async () => {
		vi.stubGlobal('window', {});
		const { connectMetaMask } = await import('$lib/wallet');

		await expect(connectMetaMask()).rejects.toThrow('MetaMask is not installed');
	});

	it('requests the Partisia snap and returns the provider', async () => {
		const request = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('window', { ethereum: { request } });
		const { connectMetaMask } = await import('$lib/wallet');

		await expect(connectMetaMask()).resolves.toEqual({ request });
		expect(request).toHaveBeenCalledWith({
			method: 'wallet_requestSnaps',
			params: { 'npm:@partisiablockchain/snap': {} }
		});
	});
});
```

**Verify:**

```bash
npx vitest run src/lib/wallet.test.ts 2>&1 | tail -6
npx vitest run --coverage 2>&1 | grep -E 'wallet.ts|All files'
```

Expected: `Tests  7 passed` in that file, **165 passed** overall, and `wallet.ts` at **100 %**
statements with no uncovered line numbers.

**Commit:** `test(wallet): test connectPartisia and connectMetaMask for real`

---

#### Task 2.2 — Raise the coverage floor to the level Task 2.1 reached

**Modify:** `vite.config.ts`

```bash
npx vitest run --coverage 2>&1 | grep 'All files'
```

Read the four percentages. Set each `thresholds.*` value in `vite.config.ts` to
`Math.floor(observed) - 1` — a one-point cushion so an unrelated refactor does not fail the build,
while any real removal of a test does. Expect the observed statement figure to land in the mid-to-high
90s, so the thresholds should end up around `95`.

**Verify:**

```bash
npx vitest run --coverage 2>&1 | tail -5
```

Expected: exit 0, no `ERROR: Coverage for … does not meet threshold` line.

**Commit:** `chore(test): raise the coverage floor to the current level`

---

### Phase 3 — Fixes, by impact

#### Task 3.1 — RED: prove `/register/[name]` shows the wrong domain after the parent redirect (do **not** commit)

**Create:** nothing. **Modify:** `tests/e2e/domain-registration.spec.ts`

Append this test to the file's top-level `describe`:

```ts
test('3.10 - subdomain of an unregistered parent lands on the parent checkout', async ({
	page
}) => {
	// A parent nobody has registered, so `/api/domains/.../check` reports parentPresent:false
	// and the page redirects to the parent's own registration URL.
	const parent = `nope${Date.now()}.mpc`;

	await page.goto(`/register/sub.${parent}`);
	await page.waitForURL(`**/register/${parent}`);

	await expect(page.locator('[data-testid="checkout-content"] h4')).toHaveText(parent);
});
```

**Verify — this must FAIL:**

```bash
npx playwright test tests/e2e/domain-registration.spec.ts -g "3.10" --retries=0 2>&1 | tail -20
```

Expected: **1 failed**, with the assertion showing `Received string: "sub.nope….mpc"` against
`Expected string: "nope….mpc"` — the checkout is offering the child at the parent's URL. That is F1.

**Do not commit.** Task 3.2 makes it green and commits both together.

---

#### Task 3.2 — GREEN: re-analyse `/register/[name]` when the route param changes

**Modify:** `src/routes/register/[name]/+page.svelte`

Apply the same pattern round 1 used at `src/routes/domain/[name]/+page.svelte:16-44`. Replace
lines 18-22 with:

```ts
const isDomainPresent = writable<boolean | undefined>();
const isParentPresent = writable<boolean>();
const analyzed = writable<IDomainAnalyzed>();

let mounted = false;
let requestId = 0;

// SvelteKit reuses this component when only `[name]` changes, and the parent-not-found branch
// below redirects to `/register/<parent>` — the same route. A name captured once would leave
// the old domain rendered under the new URL.
$: nameParam = $page.params.name ?? '';
// Gated on `mounted` so the first run happens after mount, never mid-hydration.
$: if (mounted) analyzeAndCheck(nameParam);
```

Then replace the whole `onMount(async () => { … });` block at lines 52-82 with:

```ts
onMount(() => {
	mounted = true;
});

async function analyzeAndCheck(name: string) {
	const currentRequestId = ++requestId;
	isDomainPresent.set(undefined);

	try {
		analyzed.set($metaNamesSdk.domainRepository.analyze(name));
	} catch (error) {
		let errorMessage = 'Failed to analyze domain.';
		if (error instanceof Error) errorMessage = error.message;
		alertMessage.set(errorMessage);

		return goto('/', { replaceState: true });
	}

	const check = await fetchApiJson<DomainCheckResponse>(`/api/domains/${$analyzed.name}/check`);
	// A redirect started a newer pass; that pass owns the stores now.
	if (currentRequestId !== requestId) return;

	if ('error' in check) {
		alertMessage.set(check.error);

		return goto('/', { replaceState: true });
	}

	isDomainPresent.set(check.domainPresent);
	if (check.domainPresent) {
		alertMessage.set('Domain already registered.');

		return goto(`/domain/${$analyzed.name}`, { replaceState: true });
	}

	isParentPresent.set(check.parentPresent);
	if ($analyzed.parentId && !check.parentPresent)
		return goto(`/register/${$analyzed.parentId}`, { replaceState: true });
}
```

Everything else in the file — the `payment` function, the markup, `$: domainName`, `$: tld` — is
unchanged. The template's `{#if $isDomainPresent === undefined}` guard already renders the spinner
while a fresh pass is in flight, which is why `analyzeAndCheck` resets it up front.

**Also modify:** `src/routes/register/[name]/SubdomainRegistration.svelte:26` — no change needed
here yet; Task 3.7 rewrites that line as part of the read-failure work.

**Verify:**

```bash
npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -2
npx vitest run 2>&1 | tail -4
npx playwright test tests/e2e/domain-registration.spec.ts --retries=0 2>&1 | tail -10
```

Expected: `0 errors and 0 warnings`; **165 passed**; every test in `domain-registration.spec.ts`
passing, including `3.10`.

**Commit:** `fix(register): re-analyse the domain when the route param changes`
(stage both `tests/e2e/domain-registration.spec.ts` and `src/routes/register/[name]/+page.svelte`)

---

#### Task 3.3 — TDD a `loadOrReport` helper for the read path

**Create:** `src/lib/read.test.ts` first. Write the test, watch it fail, then write the module.

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

const { captureExceptionMock } = vi.hoisted(() => ({ captureExceptionMock: vi.fn() }));
vi.mock('@sentry/sveltekit', () => ({ captureException: captureExceptionMock }));

import { loadOrReport } from './read';
import { alertMessage } from './stores/main';

describe('loadOrReport', () => {
	beforeEach(() => {
		captureExceptionMock.mockClear();
		alertMessage.set(undefined);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns the resolved value and leaves the alert alone', async () => {
		await expect(loadOrReport(Promise.resolve('ok'), 'Could not load.')).resolves.toBe('ok');

		expect(get(alertMessage)).toBeUndefined();
		expect(captureExceptionMock).not.toHaveBeenCalled();
	});

	it('passes null through, because null is a real answer', async () => {
		await expect(loadOrReport(Promise.resolve(null), 'Could not load.')).resolves.toBeNull();

		expect(get(alertMessage)).toBeUndefined();
	});

	it('returns undefined, alerts and reports when the read rejects', async () => {
		const error = new Error('boom');

		await expect(loadOrReport(Promise.reject(error), 'Could not load.')).resolves.toBeUndefined();

		expect(get(alertMessage)).toBe('Could not load.');
		expect(captureExceptionMock).toHaveBeenCalledWith(error);
	});
});
```

**Verify it fails:**

```bash
npx vitest run src/lib/read.test.ts 2>&1 | tail -8
```

Expected: `Failed to resolve import "./read"`.

**Create:** `src/lib/read.ts`

```ts
import { captureException } from '@sentry/sveltekit';
import { alertMessage } from './stores/main';

/**
 * Await a chain read and never let a failure disappear.
 *
 * Writes go through `runTransaction`, whose rejection is surfaced by `LoadingButton`. Reads had no
 * counterpart: a rejected `find()` left the caller's spinner up forever, and — from a `setTimeout`
 * callback or a store subscription — became an unhandled rejection with no user-facing trace.
 *
 * The return type is load-bearing. `null` is a real answer from the SDK ("no such domain");
 * `undefined` means the read itself failed and the caller knows nothing either way. Callers must
 * not collapse the two — offering to register a domain because the network hiccuped is wrong.
 */
export async function loadOrReport<T>(
	read: Promise<T>,
	failureMessage: string
): Promise<T | undefined> {
	try {
		return await read;
	} catch (error) {
		console.error(error);
		captureException(error);
		alertMessage.set(failureMessage);

		return undefined;
	}
}
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npx vitest run --coverage 2>&1 | grep -E 'read.ts|All files'
```

Expected: **168 passed**, `read.ts` at 100 %.

**Commit:** `feat(lib): add loadOrReport for the read path`

---

#### Task 3.4 — Wire the domain search through `loadOrReport`

**Modify:** `src/routes/DomainSearch.svelte`

Add to the imports:

```ts
import { loadOrReport } from '$lib/read';
```

Replace lines 47-52 with:

```ts
// `loadOrReport` yields `undefined` on failure, which clears the result card and leaves the
// snackbar to explain — instead of the spinner running forever.
const result = await loadOrReport(
	$metaNamesSdk.domainRepository.find(domainName),
	'Could not search for that domain. Please try again.'
);

if (currentRequestId === requestId) {
	domain = result;
	isLoading = false;
}
```

**Verify:**

```bash
npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -2
npx vitest run 2>&1 | tail -4
npx playwright test tests/e2e/domain-search.spec.ts --retries=0 2>&1 | tail -6
```

Expected: `0 errors and 0 warnings`; 168 passed; `domain-search.spec.ts` all green.

**Commit:** `fix(search): stop the spinner and report when a domain lookup fails`

---

#### Task 3.5 — Wire the profile domain list through `loadOrReport`

**Modify:** `src/routes/profile/+page.svelte`

Add to the imports:

```ts
import { loadOrReport } from '$lib/read';
```

Replace lines 32-36 with:

```ts
const owned = await loadOrReport(
	$metaNamesSdk.domainRepository.findByOwner(address),
	'Could not load your domains. Please try again.'
);
if (currentRequestId !== requestId) return;

// Even a failed read has to stop the table's progress bar; the snackbar carries why.
domains = owned ?? [];
loaded = true;
```

**Verify:**

```bash
npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -2
npx vitest run 2>&1 | tail -4
npx playwright test tests/e2e/profile.spec.ts --retries=0 2>&1 | tail -6
```

Expected: `0 errors and 0 warnings`; 168 passed; `profile.spec.ts` all green.

**Commit:** `fix(profile): stop the progress bar and report when the domain list fails to load`

---

#### Task 3.6 — Wire the domain page through `loadOrReport`

**Modify:** `src/routes/domain/[name]/+page.svelte`

Add to the imports:

```ts
import { loadOrReport } from '$lib/read';
```

Replace lines 46-58 (the body of `loadDomain`) with:

```ts
async function loadDomain(name: string) {
	const currentRequestId = ++requestId;
	domain.set(undefined);

	const domainResponse = await loadOrReport(
		$metaNamesSdk.domainRepository.find(name),
		'Could not load the domain. Please try again.'
	);
	if (currentRequestId !== requestId) return;

	if (domainResponse) return domain.set(domainResponse);

	// `null` is a confirmed absence and an invitation to register; `undefined` means the read
	// failed, so send the user somewhere usable rather than leaving the spinner running.
	if (domainResponse === null) {
		alertMessage.set('Domain not found. Register it now!');

		return goto(`/register/${name}`, { replaceState: true });
	}

	return goto('/', { replaceState: true });
}
```

**Verify:**

```bash
npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -2
npx vitest run 2>&1 | tail -4
npx playwright test tests/e2e/domain-management.spec.ts tests/e2e/tld.spec.ts --retries=0 2>&1 | tail -6
```

Expected: `0 errors and 0 warnings`; 168 passed; both specs green.

**Commit:** `fix(domain): distinguish a missing domain from a failed lookup`

---

#### Task 3.7 — Wire the subdomain parent lookup through `loadOrReport`

**Modify:** `src/routes/register/[name]/SubdomainRegistration.svelte`

Add to the imports:

```ts
import { loadOrReport } from '$lib/read';
```

Replace lines 23-27 (the `onMount`) with:

```ts
onMount(async () => {
	const found = await loadOrReport(
		$metaNamesSdk.domainRepository.find(parentDomainName),
		'Could not load the parent domain. Please try again.'
	);
	// Only a confirmed absence (`null`) should bounce to the parent's registration page. On
	// `undefined` the lookup failed and we do not know either way, so stay put.
	if (found === undefined) return;

	parentDomain = found;
	if (!parentDomain) goto(`/register/${parentDomainName}`);
});
```

**Verify:**

```bash
npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -2
npx vitest run 2>&1 | tail -4
npx playwright test tests/e2e/domain-registration.spec.ts --retries=0 2>&1 | tail -8
```

Expected: `0 errors and 0 warnings`; 168 passed; `domain-registration.spec.ts` green, including
`3.4`, `3.9` and the `3.10` added in Task 3.1.

**Commit:** `fix(register): do not bounce to the parent when its lookup fails`

---

#### Task 3.8 — Send security response headers

**Modify:** `src/hooks.server.ts` · **Create:** `tests/api/security-headers.spec.ts`

Write the test first.

```ts
import { expect, test } from '@playwright/test';

test.describe('security response headers', () => {
	test('sets nosniff, a referrer policy and frame protection', async ({ request }) => {
		const response = await request.get('/');

		expect(response.headers()['x-content-type-options']).toBe('nosniff');
		expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
		expect(response.headers()['x-frame-options']).toBe('DENY');
	});
});
```

**Verify it fails:**

```bash
npx playwright test tests/api/security-headers.spec.ts --retries=0 2>&1 | tail -12
```

Expected: **1 failed** — `Received: undefined`.

Now edit `src/hooks.server.ts`. Change the import on line 1 to add the `Handle` type, and replace
line 17:

```ts
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
```

```ts
// The app is never framed and never needs a cross-origin referrer. These three cost nothing and
// close the easiest openings. A full CSP is deliberately not attempted here: SMUI emits inline
// style attributes and Sentry/Vercel add runtime origins, and there is no gate that would catch a
// policy that silently breaks production styling.
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');

	return response;
};

export const handle = sequence(sentryHandle(), securityHeaders);
```

**Verify:**

```bash
npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -2
npx playwright test tests/api --retries=0 2>&1 | tail -8
```

Expected: `0 errors and 0 warnings`; every `tests/api` spec green, including the new one.

**Commit:** `feat(security): send nosniff, referrer-policy and frame-options headers`

---

#### Task 3.9 — Give `/profile` a document title

**Modify:** `src/routes/profile/+page.svelte` · `tests/e2e/profile.spec.ts`

Add to `tests/e2e/profile.spec.ts` (inside its top-level `describe`; no wallet needed):

```ts
test('the profile page sets a document title', async ({ page }) => {
	await page.goto('/profile');

	await expect(page).toHaveTitle('Profile | Meta Names');
});
```

**Verify it fails:**

```bash
npx playwright test tests/e2e/profile.spec.ts -g "document title" --retries=0 2>&1 | tail -10
```

Expected: **1 failed** — the actual title is empty or the URL.

Now insert this into `src/routes/profile/+page.svelte`, immediately after the closing `</script>`
and before `<div class="profile content">`:

```svelte
<svelte:head>
	<title>Profile | Meta Names</title>
</svelte:head>
```

**Verify:**

```bash
npx playwright test tests/e2e/profile.spec.ts --retries=0 2>&1 | tail -6
```

Expected: all `profile.spec.ts` tests green.

**Commit:** `fix(a11y): give the profile page a document title`

---

### Phase 4 — Cleanup

#### Task 4.1 — Drop the five dependencies nothing imports

**Modify:** `package.json`, `package-lock.json`

Confirm first, so the removal is evidence-led rather than trusting this document:

```bash
for p in chart.js svelte-chartjs @secata-public/bitmanipulation-ts @smui/radio @smui/form-field; do
  echo -n "$p: "; grep -rF "$p" src tests vite.config.ts svelte.config.js 2>/dev/null | wc -l
done
```

Expected: every line reads `0`. If any is non-zero, **stop** and leave that package alone.

```bash
npm uninstall chart.js svelte-chartjs @secata-public/bitmanipulation-ts @smui/radio @smui/form-field
```

**Verify:**

```bash
npx vitest run 2>&1 | tail -4
npx svelte-check --tsconfig ./tsconfig.json 2>&1 | tail -2
npx vite build 2>&1 | tail -4
npm audit --omit=dev 2>&1 | grep -c 'svelte-chartjs'
```

Expected: 168 passed; `0 errors and 0 warnings`; `✓ built in …`; the audit grep prints **0**.
If `vite build` or `svelte-check` regresses, reinstall the offending package and note why in the
commit body — SMUI 7 resolves `@smui/form-field` transitively under npm's hoisted layout, so a
strict-`node_modules` package manager could behave differently.

**Commit:** `chore(deps): remove five packages with no references`

---

#### Task 4.2 — Stop compiling the SMUI light theme nothing imports

**Modify:** `package.json`

`src/styles/app.scss:3` imports only `./theme/smui-dark.css`, so `smui-theme-light` writes 382 kB of
dead CSS on every build. Change `package.json:6`:

```json
	"generate:themes": "npm run smui-theme-dark",
```

Leave the `smui-theme-light` script itself in place — it stays available for anyone reviving the
light palette in `src/theme/`. Add a note above it is unnecessary; the script name says it.

**Verify:**

```bash
rm -f src/styles/theme/smui.css src/styles/theme/smui-dark.css
npm run generate:themes
ls -la src/styles/theme/
npx vite build 2>&1 | tail -4
```

Expected: `src/styles/theme/` contains `.keep` and **only** `smui-dark.css`; no `smui.css`; the build
succeeds. (Both files are gitignored at `.gitignore:15-16`, so nothing appears in `git status`.)

**Commit:** `chore(build): only compile the dark SMUI theme, which is the only one imported`

---

#### Task 4.3 — Keep stray pnpm artifacts out of the repository

**Modify:** `.gitignore`, `README.md`

`pnpm-lock.yaml` (285 kB) and `pnpm-workspace.yaml` are sitting untracked in the working tree beside
`package-lock.json`. This task **does not delete them** — it only stops a `git add -A` committing a
second, drifting lockfile.

Append to `.gitignore`:

```
# This repo is npm-based (package-lock.json). Stray artifacts from other package
# managers must not be committed alongside it.
pnpm-lock.yaml
pnpm-workspace.yaml
yarn.lock
```

Extend the note already in `README.md` (the paragraph beginning "Use `npm`, not yarn") with one
sentence:

```
The same goes for pnpm: a `pnpm-lock.yaml` next to `package-lock.json` means CI (`npm ci`) and
your local tree can resolve to different versions, so both are gitignored.
```

**Verify:**

```bash
git status --short
npx prettier --plugin prettier-plugin-svelte --check . 2>&1 | tail -3
```

Expected: `git status --short` no longer lists `pnpm-lock.yaml` or `pnpm-workspace.yaml` as
untracked (only the two edited files show as modified); Prettier reports all files clean.

**Commit:** `chore: ignore stray pnpm and yarn lockfiles`

---

## FINAL VERIFICATION

Run all five gates from a clean tree. Every one must pass before this plan is considered done.

```bash
# 1 — typecheck
npx svelte-kit sync && npx svelte-check --tsconfig ./tsconfig.json
# expected: svelte-check found 0 errors and 0 warnings

# 2 — lint
npx eslint .
# expected: no output, exit 0

# 3 — format
npx prettier --plugin prettier-plugin-svelte --check .
# expected: All matched files use Prettier code style!

# 4 — unit tests + coverage thresholds
npm run test:coverage
# expected: Test Files 22 passed (22) · Tests 168 passed (168)
# expected: no "ERROR: Coverage for ... does not meet threshold" line
# expected: wallet.ts 100 %, read.ts 100 %, All files ≥ the thresholds set in Task 2.2

# 5 — full Playwright suite
npx playwright test
# expected: every test passing, including the three added here —
#   domain-registration.spec.ts "3.10 - subdomain of an unregistered parent ..."
#   tests/api/security-headers.spec.ts "sets nosniff, a referrer policy and frame protection"
#   profile.spec.ts "the profile page sets a document title"
# note: the 2 pre-existing flaky wallet-menu tests are owned by another worker;
#       if they still flake, that is not a regression from this plan.

# 6 — production build
npx vite build
# expected: ✓ built in ~30s, no new warnings
```

**Net effect if every task lands:** one correctness bug fixed (F1), four permanent-spinner /
silent-rejection paths closed behind a tested helper (F2), coverage turned into an enforced gate at
~95 % over `src/lib` with a tautological suite replaced by real tests (F3), five dependencies and one
`npm audit` runtime finding removed (F4), 382 kB of dead Sass compilation dropped from every build
(F5), three security headers added (F6), the last missing document title added (F7), and CI made
consistent and coverage-gated (F8).
