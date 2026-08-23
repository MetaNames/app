# MetaNames App Improvement Plan — Round 4: Accessibility, Reflow and Render-Blocking CSS

> **For Hermes:** Use the subagent-driven-development skill to implement this plan task-by-task. One
> conventional commit per task. Do not skip the batch gates or the two-stage review at each batch
> boundary. Do not push.

**Goal:** Close the WCAG 2.2 AA defects this app actually has (reflow at 320 px, contrast, missing
accessible names, unannounced async results, no `h1`), kill the 4.0 s LCP / 0.149 CLS on
`/domain/[name]`, and attack the one initial-load cost three rounds of JS work never touched — a
361 KB render-blocking stylesheet that is measurably worth **728 ms of FCP on every route**.

**Architecture:** A SvelteKit 2 SPA-with-SSR on Vercel, Svelte 4, SMUI 7 over MDC 14. Route
components in `src/routes`, shared components in `src/components`, chain access through a single
`@metanames/sdk` instance in `src/lib/stores/sdk.ts`, plus five `+server.ts` endpoints under
`src/routes/api` that do the same reads server-side via `src/lib/server/index.ts`. Pure logic in
`src/lib/*.ts` under Vitest; anything needing a browser and a chain runs under Playwright against
testnet. This round changes presentation, semantics, one route's data-loading position, and the CSS
build pipeline. It changes no crypto, no signing path and no transaction construction.

**Tech Stack:** SvelteKit 2.55 · Svelte 4.2 · TypeScript 5.9 (strict) · SMUI 7 / MDC 14 · Vite 5.4 ·
Vitest 2.1 · Playwright **1.48.1 (pinned — do not change)** · `axe-core` 4.10.2 (new devDependency,
see Task B1) · Node 26.5.1 · npm only.

**Baseline commit:** `003f301` on `staging`. Every number in this plan was measured at that commit.

---

## 1. Scope

### In scope

| #   | Theme                                                                                | Why it is here                                         |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 1   | WCAG 2.2 AA reflow failures at 320 CSS px on `/register/[name]` and `/domain/[name]` | SC 1.4.10, reproduced with exact `scrollWidth` numbers |
| 2   | SC 1.4.3 contrast failure on the home subtitle                                       | axe-measured 4.35:1                                    |
| 3   | Missing accessible name on the payment-token combobox                                | SC 4.1.2, axe `aria-input-field-name` (serious)        |
| 4   | Async results and loading states never announced                                     | SC 4.1.3                                               |
| 5   | Missing `aria-invalid` on every invalid text field                                   | SC 4.1.2                                               |
| 6   | No `h1` on any route; heading order skips levels                                     | SC 1.3.1 / axe best-practice, 7/7 routes               |
| 7   | `/domain/[name]` LCP 4064 ms and CLS 0.1492                                          | measured, throttled mobile                             |
| 8   | 361 KB render-blocking stylesheet on every route                                     | measured worth 728 ms of FCP                           |
| 9   | Chip values ellipsised to a fixed 100 px at every viewport                           | UX; also the direct cause of finding 1 on `/domain`    |
| 10  | Weak, inconsistent focus indicator; no `prefers-reduced-motion`                      | usability; 1.53:1 measured change-of-contrast          |
| 11  | Wrong/unhelpful document titles; 40 KB of unreferenced files in `static/`            | hygiene, cheap                                         |

### Out of scope — hard constraints for this round

- **Svelte 5 migration.** Explicitly deferred. No task in this plan may introduce runes, `$state`,
  `$derived`, `$props`, or `svelte@5`.
- **CSP.** Explicitly deferred. No `Content-Security-Policy` header, no `csp` block in
  `svelte.config.js`, no nonce plumbing.
- **Migrating off SMUI.** Not permitted. Fixes work _with_ SMUI 7 / MDC 14, including by overriding
  its output, never by replacing a component with a hand-rolled one.
- **Cosmetic `manualChunks` reshaping.** Splitting or merging chunks that leaves the initial route
  payload unchanged is forbidden — including merging chunks purely to reduce request count. See
  "Rejected" R6 for the measurement that tempted this and why it is still rejected.
- **Dependency upgrades and `npm audit fix`.** The 68 reported vulnerabilities are pre-existing
  dependency debt outside this round. One new devDependency is added (`axe-core`, Task B1) and
  nothing else.
- **Pushing.** All commits stay local.

---

## 2. Invariants

These must hold after every single task, not just at batch boundaries.

1. **Crypto and signing are untouched.** No file under `src/lib/node-compat/`, `src/lib/wallet.ts`,
   `src/lib/transaction.ts` or `src/lib/sdk.ts` changes. The `node-compat` tripwire in
   `vite.config.ts` stays armed and `forbiddenInBrowser` is not shortened.
2. **`bn.js` remains deduped to exactly one copy** and `resolve.dedupe` is not edited.
3. **Sentry stays lazy.** `src/lib/sentry.ts`'s memoised loader and the `requestIdleCallback` warm-up
   in `src/hooks.client.ts` are not made eager.
4. **`loadOrReport`'s three-state contract survives**: `null` means "the chain says no such domain",
   `undefined` means "the read failed and we know nothing". No task may collapse them.
5. **SHARED initial payload does not regress.** `npm run measure` must report **≤ 1023 KB across
   ≤ 20 chunks** at every batch gate.
6. **Coverage thresholds hold.** `vite.config.ts` `test.coverage.thresholds` (98/94/99/98) are not
   lowered.
7. **No test is deleted or skipped** to make a gate pass. 213 unit tests and 64 e2e tests are a
   floor, not a target.
8. **Playwright stays at 1.48.1** and `playwright.config.ts`'s `reuseExistingServer: false` stays.
9. **Prettier and ESLint stay clean** — `npm run lint` is part of every gate, not an afterthought.

---

## 3. Measured baseline at `003f301`

All browser numbers come from Chromium via the pinned Playwright 1.48.1, driving `vite preview`
serving the real production build (`npm run build`), **not** the dev server.

### 3.1 Gate state

| Gate      | Command                                                                   | Result at `003f301`                  | Source                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typecheck | `npm run check`                                                           | 1776 files, **0 errors, 0 warnings** | re-run during this audit                                                                                                                                                       |
| Lint      | `npm run lint`                                                            | prettier clean, eslint exit 0        | re-run during this audit                                                                                                                                                       |
| Unit      | `npm run test:unit`                                                       | **213 passed / 26 files**            | re-run during this audit                                                                                                                                                       |
| Build     | `npm run build`                                                           | exit 0                               | re-run during this audit                                                                                                                                                       |
| Bundle    | `npm run measure`                                                         | SHARED **1023 KB / 20 chunks**       | re-run during this audit                                                                                                                                                       |
| E2E       | `PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run test:integration` | **64 passed**                        | **carried from the Round 3 verdict — not re-run here.** Re-establish it before Batch A's first commit, so a pre-existing e2e failure is never mistaken for one of this plan's. |

### 3.2 Initial-load JS per route (`npm run measure`, reproduced today)

| Route                     |   Total | Route-only | Chunks |
| ------------------------- | ------: | ---------: | -----: |
| `/domain/[name]`          | 1297 KB |     274 KB |     34 |
| `/tld`                    | 1294 KB |     270 KB |     32 |
| `/profile`                | 1211 KB |     188 KB |     28 |
| `/domain/[name]/renew`    | 1178 KB |     155 KB |     32 |
| `/domain/[name]/transfer` | 1177 KB |     154 KB |     30 |
| `/register/[name]`        | 1136 KB |     113 KB |     31 |
| `/`                       | 1123 KB |     100 KB |     27 |

SHARED: 1023 KB across 20 chunks. Largest: `ksS9TEvL.js` 344 KB, `Dtuecstc.js` 250 KB,
`Dfy3JKba.js` 133 KB, `C1HWtTf_.js` 81 KB, `nodes/0.C4x2Zc6O.js` 63 KB.

### 3.3 Field metrics — throttled mobile

Viewport 390 × 844, `isMobile`, DPR 2. CDP `Network.emulateNetworkConditions` 1.6 Mbps down /
750 kbps up / 150 ms RTT, `Emulation.setCPUThrottlingRate` 4×. Single run per route.

| Route              | TTFB |  FCP |  **LCP** |    **CLS** | long-task ms | init JS (enc) | init JS reqs | init CSS (enc) |
| ------------------ | ---: | ---: | -------: | ---------: | -----------: | ------------: | -----------: | -------------: |
| `/`                |    8 | 1144 |     1144 |     0.0006 |          735 |        457 KB |           34 |          34 KB |
| `/domain/[name]`   |    8 | 1128 | **4064** | **0.1492** |          861 |        502 KB |           40 |          34 KB |
| `/register/[name]` |    7 | 1208 | **3224** |          0 |          904 |        463 KB |           38 |          34 KB |
| `/profile`         |    6 | 1148 |     1148 |     0.0006 |          779 |        479 KB |           35 |          34 KB |
| `/tld`             |   10 | 1164 |     1164 |     0.0079 |          778 |        501 KB |           39 |          34 KB |

TTFB is single-digit because the origin is local; treat it as "server time removed", which makes the
rest of the numbers a clean read on client cost.

### 3.4 The render-blocking stylesheet

`_app/immutable/assets/0.CLdw8if6.css` — the layout node's stylesheet, linked from `<head>` on every
route via `src/routes/+layout.svelte:23` → `src/styles/app.scss:3`.

|                                                    |              bytes |
| -------------------------------------------------- | -----------------: |
| raw                                                |            369,601 |
| gzip                                               |             35,018 |
| brotli                                             |             25,172 |
| matched by Chromium CSS coverage over all 7 routes | **22,182 (6.0 %)** |

Waterfall on `/`, throttled as in 3.3 — the stylesheet is fetched at `VeryHigh` priority starting at
181 ms and **29 JS chunks start at `High` between 192 ms and 204 ms**:

```
start   end   dur    bytes  priority   name
  181  1063   883    35018  VeryHigh   0.CLdw8if6.css      <-- render-blocking
  192   356   165      396  High       start.B_onZ1j5.js
  194  1299  1105    44213  High       Dfy3JKba.js
  195  1799  1605    60542  High       Dtuecstc.js
  195  2286  2091   105938  High       ksS9TEvL.js
  ... 25 more High-priority chunks starting 193-204 ...
FCP = 1148 ms   (85 ms after the stylesheet lands)
```

35 KB at 200 KB/s is ~175 ms of bytes; it takes **883 ms** because it shares the pipe with 29
concurrent JS requests.

**A/B — both arms served from disk by `vite preview` over the identical throttled path, median of 3:**

| Stylesheet served  |     raw |    gzip | fetch window           |  **FCP** |  LCP |  DCL | long-task ms |
| ------------------ | ------: | ------: | ---------------------- | -------: | ---: | ---: | -----------: |
| as built           |  361 KB | 35.0 KB | 187 → 1072 ms (886 ms) | **1160** | 1160 | 1150 |          745 |
| matched-rules-only | 21.7 KB |  3.7 KB | 185 → 394 ms (209 ms)  |  **432** |  432 |  428 |          658 |

**Δ FCP = −728 ms (−63 %).**

Two control experiments decompose that number:

- **Parse/recalc only** — both arms `route.fulfill`ed locally so transfer is free and equal:
  361 KB → FCP 328 ms, 21.7 KB → FCP 288 ms. **Parse and style recalculation are worth ~40 ms.**
- **Contention only** — full stylesheet, but every `_app/immutable/**/*.js` delayed 1200 ms:
  the same 35 KB stylesheet fetches in **351 ms instead of 880 ms** and FCP drops
  **1152 → 624 ms**.

So ~40 ms is parse and ~690 ms is a render-blocking fetch starved by the JS fan-out. Shrinking the
stylesheet fixes both halves; nothing else available to us fixes either.

**Byte attribution** (top-level rule bytes containing each class prefix; `@media` wrappers land in
`(other)`):

| block                |     KB |       % | block                 |  KB |   % |
| -------------------- | -----: | ------: | --------------------- | --: | --: |
| `(other)` / `@media` |     69 |    19.0 | `mdc-icon-button`     |  13 | 3.7 |
| `mdc-list`           |     62 |    17.3 | `mdc-ripple`          |  12 | 3.3 |
| `mdc-text-field`     |     32 |     8.9 | `mdc-data-table`      |  11 | 3.0 |
| `mdc-select`         |     30 |     8.4 | `mdc-top-app-bar`     |   9 | 2.4 |
| `mdc-button`         |     27 |     7.5 | `mdc-tab`             |   9 | 2.4 |
| **`mdc-checkbox`**   | **22** | **6.2** | `mdc-dialog`          |   8 | 2.2 |
| `smui-*`             |     17 |     4.7 | `mdc-linear-progress` |   8 | 2.1 |

`mdc-checkbox` is 22 KB for a component the app never renders: `@smui/checkbox` is not in
`package.json`, it arrives as a transitive dependency of `@smui/data-table`, and
`src/routes/profile/DomainsTable.svelte` uses no row selection.

> **Honesty caveat, load-bearing for Batch D.** The 6.0 % coverage figure is an **upper bound on
> what is deletable, not a licence to delete 94 %**. Chromium CSS coverage only counts rules that
> matched during the traversal, and a static traversal never enters the states MDC applies from
> JavaScript — `mdc-ripple-upgraded--background-focused`, `mdc-snackbar--open`,
> `mdc-menu-surface--open`, `mdc-text-field--invalid`, `mdc-select--activated`,
> `mdc-dialog--opening`, and so on. The 21.7 KB sheet used in the A/B above is a **measurement
> probe, not a shippable artifact**; it would break every interactive state in the app. Batch D
> therefore builds the safety gate _before_ it removes a single byte, and is explicitly allowed to
> abandon itself (see §8).

### 3.5 Accessibility baseline

axe-core 4.10.2 injected via `page.addScriptTag`, tags `wcag2a, wcag2aa, wcag21a, wcag21aa,
wcag22aa, best-practice`, across 7 routes × 3 viewports (1440×900, 375×667, 320×568).

| Rule                    | Impact   | Tags                  | Routes                             | Detail                                                     |
| ----------------------- | -------- | --------------------- | ---------------------------------- | ---------------------------------------------------------- |
| `page-has-heading-one`  | moderate | best-practice         | **7/7**                            | no `<h1>` anywhere in the app                              |
| `color-contrast`        | serious  | wcag2aa, **SC 1.4.3** | `/`                                | `p.subtitle` `#9b9a9a` on `#363535` = **4.35:1** at 10 px  |
| `aria-input-field-name` | serious  | wcag2a, **SC 4.1.2**  | `/register`, `/renew`              | `.mdc-select__anchor` `role=combobox` with no name         |
| `heading-order`         | moderate | best-practice         | `/register`, `/renew`, `/transfer` | `h2` → `h4`                                                |
| `aria-allowed-role`     | minor    | best-practice         | 7/7                                | `role="toolbar"` on `.mdc-top-app-bar__section--align-end` |

Probes beyond axe:

| Probe                                            | Result                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reflow, doc `scrollWidth` vs `clientWidth` @ 320 | `/register` **391 / 320**, `/domain` **339 / 320**; @ 375 `/register` **393 / 375**. Other 5 routes clean.                                                                                                                                                                                                                                                      |
| CDP AX tree, `/register`                         | `combobox` `name="" from=none`; the visible `.mdc-floating-label` says "Select Token"                                                                                                                                                                                                                                                                           |
| Search result live region                        | `[data-testid=domain-result-registered]` renders "test.mpc Registered"; walking ancestors to `<body>` finds **no** `aria-live` / `role=status\|alert\|log`                                                                                                                                                                                                      |
| Invalid field, `/transfer` with "nope"           | wrapper gets `mdc-text-field--invalid`, `aria-describedby` resolves to "Address is invalid", **`aria-invalid` is `null`**                                                                                                                                                                                                                                       |
| Focus indicator, 5 controls sampled              | all 5 do change on focus (SC 2.4.7 met). MDC uses `outline: none` + `::before` white @ .24 opacity: on the header button `#6849FE → #8C75FE`, a **1.53:1** change-of-contrast vs the 3:1 of SC 2.4.13. Native links keep the UA `outline: auto` ring — two different indicators on one page. `grep -c focus-visible` over `src/` and the compiled theme: **0**. |
| `autofocus` on the home search field             | `input` has **no** `autofocus` attribute; the wrapper `div` does. `document.activeElement === BODY` after load. SMUI's `Textfield` forwards it to the wrapper.                                                                                                                                                                                                  |
| Touch targets < 24×24 (SC 2.5.8)                 | **none** on any route/viewport                                                                                                                                                                                                                                                                                                                                  |
| `prefers-reduced-motion`                         | **0** occurrences in `src/` and in the compiled theme                                                                                                                                                                                                                                                                                                           |
| Skip link                                        | none — but only 2 focusable elements precede `<main>` (see Rejected R1)                                                                                                                                                                                                                                                                                         |

### 3.6 CLS and LCP attribution on `/domain/[name]`

```
LCP entries:  1160 ms  SPAN.mdc-button__label   size 3160   <- the "Connect Wallet" text
              4044 ms  H5.domain                size 3840   <- the actual page subject
layout-shift: 3276 ms  v=0.0006  SECTION.mdc-top-app-bar__section, SPAN.testnet
              4023 ms  v=0.1406  DIV.content, FOOTER          <- 94% of total CLS
              4201 ms  v=0.0080  DIV.content, DIV.domain-container
```

Cause: the route has no `+page.ts`. `src/routes/domain/[name]/+page.svelte:25` gates `showDomain()`
on `mounted`, set in `onMount` at `:28` — so the chain read cannot begin until ~1.5 MB of JS has
downloaded, parsed and hydrated. Until it resolves the page renders only a 32 px spinner, so the
footer sits near the top of the viewport and is shoved down when the card appears.
`/register/[name]` has the same shape (LCP 3224 ms) via `fetchApiJson` at `:78`.

`src/routes/api/domains/[name]/+server.ts` already performs exactly this read server-side and
returns `{"domain":{...}}` with dates as ISO strings. Batch C uses it.

### 3.7 Dead files

`static/~normalize.css/normalize.css` and `static/~@fontsource/{inter,roboto}/{500,700,900,index}.css`
— 9 files, ~40 KB, copied into every deploy. `grep -rn "fontsource\|normalize.css"` over `src/`,
`svelte.config.js` and `vite.config.ts` returns nothing, and the served HTML links 4 stylesheets,
none of them these. Leftovers from a `~`-prefixed import convention no longer in use.

---

## 4. User-facing acceptance criteria

Each is written as something a person can check, not a metric.

| #    | Criterion                                                                                                         | Verified by                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| AC1  | On a 320 px-wide phone, no page ever needs sideways scrolling to read a fee, a chip or a domain name.             | `tests/e2e/reflow.spec.ts`                                      |
| AC2  | Every page announces what it is: a screen reader's "list headings" starts with a level-1 heading naming the page. | `tests/e2e/a11y.spec.ts`                                        |
| AC3  | A blind user who types a domain name hears the answer — "test.mpc, Registered" — without moving focus.            | `tests/e2e/a11y.spec.ts`                                        |
| AC4  | A screen reader announces "invalid" on a bad recipient address, not just a red outline.                           | `tests/e2e/a11y.spec.ts`                                        |
| AC5  | The "Powered by Partisia" line, and every other text on the page, is legible at AA contrast.                      | axe `color-contrast` clean                                      |
| AC6  | A keyboard user can always see where they are, with the same kind of indicator on every control.                  | `tests/e2e/a11y.spec.ts` focus-ring assertion                   |
| AC7  | Someone who has asked their OS to reduce motion sees no ripples, spinner spin or slide-in transitions.            | `tests/e2e/a11y.spec.ts` under `prefers-reduced-motion: reduce` |
| AC8  | Opening a domain page shows the domain, not a spinner that then shoves the page around.                           | CLS ≤ 0.02 and no `FOOTER` shift source                         |
| AC9  | On a mid-range phone on 4G, the page paints in well under a second instead of well over one.                      | `scripts/measure-field-metrics.js`                              |
| AC10 | A domain's owner address and link are readable on a desktop screen instead of cut to eleven characters.           | `tests/e2e/domain-management.spec.ts`                           |

---

## 5. Execution protocol

### Per task

1. Write the failing test. 2. Run it, see it fail, and **record the failure message** — a test that
   passes before the change is a broken test, not a finished task. 3. Write the minimal change.
2. Run the test, see it pass. 5. `npm run lint` and `npm run check`. 6. Commit, one conventional
   commit, subject only, no body unless the reason is non-obvious.

Tasks are sized for 2–5 minutes. If a task takes longer than that, it was mis-specified — stop,
record it under §8 errata, and split it.

### Per batch gate

Run **all** of these, in this order, from `/opt/data/work/metanames-app`:

```bash
npm run check
npm run lint
npm run test:unit
npm run build
npm run measure
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run test:integration
```

Required: check 0 errors / 0 warnings · lint exit 0 · unit ≥ 213 passed · build exit 0 · measure
SHARED ≤ 1023 KB / ≤ 20 chunks · e2e ≥ 64 passed plus the batch's new specs, 0 failures.

> **Known environment defect, carried from Round 3 — do not misdiagnose it.**
> `tests/e2e/blockchain-ops.spec.ts` B4 fails **iff a Playwright trace is being recorded**
> (truncated 61 KB `trace.zip` vs 1–2.6 MB siblings), and a testnet-latency flake in B1 is what
> triggers the retry that turns tracing on. Two full-suite `--trace=off` runs are 64/64. If B4
> fails, re-run the suite with `--trace=off` before treating it as a regression, and say so in the
> batch report.

### Per batch review

After the gate is green, and **not before**:

1. **Fresh spec-compliance review.** A subagent with no memory of the implementation reads this
   plan's batch section and the batch's diff, and answers only: does the diff do what the plan
   says, no more and no less? Verdict must be **PASS**. On FAIL, fix and re-review with a _new_
   subagent.
2. **Separate fresh quality review.** A different subagent, also with no implementation context,
   reviews the same diff for correctness, reuse, simplification and test quality. Verdict must be
   **APPROVED**. On CHANGES-REQUESTED, fix and re-review with a _new_ subagent.

Do not begin the next batch until both verdicts land.

---

## Batch A — Reflow and contrast (WCAG 2.2 AA)

Pure CSS and markup. No JavaScript behaviour changes. Fixes AC1, AC5, AC10.

### Task A1: Add the failing reflow spec

**Objective:** Pin the two 320 px reflow failures with a test that fails today.

**Files:**

- Create: `tests/e2e/reflow.spec.ts`

**Step 1: Write the failing test**

```typescript
import { expect, test } from '@playwright/test';

/**
 * WCAG 2.2 SC 1.4.10 Reflow: content must be usable at 320 CSS px wide without
 * two-dimensional scrolling. 320 px is also what a 1280 px desktop looks like at
 * the 400 % zoom SC 1.4.10 names, so this one assertion covers both audiences.
 */
const ROUTES = [
	['/', 'home'],
	['/domain/test.mpc', 'domain'],
	['/register/zzunregistered123', 'register'],
	['/profile', 'profile'],
	['/tld', 'tld'],
	['/domain/test.mpc/renew', 'renew'],
	['/domain/test.mpc/transfer', 'transfer']
] as const;

test.describe('reflow at 320 CSS px', () => {
	for (const [path, name] of ROUTES) {
		test(`${name} does not scroll horizontally`, async ({ page }) => {
			await page.setViewportSize({ width: 320, height: 568 });
			await page.goto(path, { waitUntil: 'networkidle' });
			// The chain read behind /domain and /register resolves after hydration.
			await page.waitForTimeout(2000);

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
```

**Step 2: Run it and record the failure**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/reflow.spec.ts
```

Expected: **5 passed, 2 failed** — `register: 391px of content in a 320px viewport` and
`domain: 339px of content in a 320px viewport`.

**Step 3: Commit**

```bash
git add tests/e2e/reflow.spec.ts
git commit -m "test(a11y): pin the 320px reflow failures on /register and /domain"
```

---

### Task A2: Let the fee panel reflow

**Objective:** Make `/register/[name]` pass A1 by removing the 5 rem padding that leaves 96 px of
usable width at 320 px, and by letting long domain names wrap.

**Files:**

- Modify: `src/components/DomainPayment.svelte` (style block, `:174` and `:184-215`)

**Why:** at 320 px `.fees` is 256 px wide with `padding: 0 5rem` — **96 px** of content width. At
375 px it is 306 px wide with the same 160 px of padding — **146 px**. The existing
`@media (max-width: 768px)` block at `:204` changes `.row`'s direction and `.title`'s margin but
never touches the padding. Separately, `h4` has no `overflow-wrap`, so `zzunregistered123.mpc`
lays out 359 px wide inside a 256 px box and is clipped at the card edge.

**Step 1: Make `h4` wrap**

Replace the `h4` rule:

```scss
h4 {
	margin-top: 0;
	text-align: center;
	overflow-wrap: anywhere;
}
```

**Step 2: Make the horizontal padding responsive**

Inside `.fees, .coin`, replace `padding: 0 5rem;` with:

```scss
// 5rem is 160px of padding; at 320px that left 96px for the fee rows and pushed the
// document to 391px of scroll width. Scale it with the viewport instead of dropping it,
// so the desktop layout is unchanged.
padding: 0 clamp(0.5rem, 12vw, 5rem);
```

**Step 3: Verify**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/reflow.spec.ts -g register
```

Expected: PASS. Also confirm the desktop layout is unchanged: at 1440 px `12vw` = 172.8 px, clamped
to 5 rem = 80 px — identical to today.

**Step 4: Commit**

```bash
git add src/components/DomainPayment.svelte
git commit -m "fix(a11y): let the payment card reflow at 320px (WCAG 1.4.10)"
```

---

### Task A3: Stop chips from forcing horizontal scroll, and stop truncating them on desktop

**Objective:** Make `/domain/[name]` pass A1, and fix the fixed-100 px ellipsis that renders the
owner address as `00373c68df…` on a 1440 px screen.

**Files:**

- Modify: `src/components/Chip.svelte` (style block, `:74-91`)

**Why:** two faces of one rule. `.value` is `white-space: nowrap` with no shrink, so the
`Expires 23 September, 2125` chip lays out 280 px wide and pushes `document.scrollWidth` to 339 px
at a 320 px viewport. And `.value.ellipsis` is a hard `width: 100px` at every viewport, so on the
1440 px domain page — where the card is 768 px wide with ~500 px to spare — `Owner` reads
`00373c68df…` and `link` reads `metanam.e…`. Those are the two identifiers the page exists to show.

**Step 1: Replace the `.value` rules**

```scss
.value {
	margin-left: 0.5rem;
	color: var(--mdc-theme-text-primary-on-background);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-transform: none;
	// Shrink below content width rather than forcing the chip — and the document —
	// wider than the viewport. Without this a 280px "Expires" chip made /domain
	// scroll sideways at 320px.
	min-width: 0;

	&.ellipsis {
		// Was a hard 100px at every viewport, which cut a 42-char owner address to
		// eleven characters on a 1440px screen. Give it the room it has.
		display: inline-block;
		max-width: min(28ch, 60vw);
	}
}
```

Delete the `@media (max-width: 768px) { max-width: 200px; overflow-wrap: anywhere; }` block inside
`.value` — `max-width: min(28ch, 60vw)` already narrows on small screens, and `overflow-wrap` does
nothing under `white-space: nowrap`.

**Step 2: Add a shrink floor to the button itself**

```scss
	:global(.chip) {
		max-width: 100%;

		.container {
```

**Step 3: Verify**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/reflow.spec.ts
```

Expected: **7 passed**.

**Step 4: Assert the desktop improvement so it cannot silently regress**

Append to `tests/e2e/domain-management.spec.ts`:

```typescript
test('shows more than a stub of the owner address on desktop', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto(`/domain/${registeredDomain}`, { waitUntil: 'networkidle' });

	const ownerValue = page.locator('button.chip', { hasText: 'Owner' }).locator('.value');
	await expect(ownerValue).toBeVisible();
	// 100px of Roboto at 13px fits ~11 characters; the address is 42.
	const width = (await ownerValue.boundingBox())!.width;
	expect(width).toBeGreaterThan(180);
});
```

Run it, confirm it fails on `003f301`'s CSS (width ≈ 100) and passes now.

**Step 5: Commit**

```bash
git add src/components/Chip.svelte tests/e2e/domain-management.spec.ts
git commit -m "fix(a11y): let chip values shrink and stop truncating them to 100px"
```

---

### Task A4: Fix the home subtitle contrast

**Objective:** Clear the one `color-contrast` violation in the app.

**Files:**

- Modify: `src/routes/+page.svelte` (`:32-36`)

**Why:** `p.subtitle` inherits `--mdc-theme-text-hint-on-background` = `rgba(255,255,255,.5)`, which
composites to `#9b9a9a` on `#363535` — axe measures **4.35:1** at 10 px, against the 4.5:1 that
SC 1.4.3 requires for text under 18.66 px.

**Step 1: Change the colour**

```scss
.subtitle {
	text-transform: uppercase;
	font-size: x-small;
	// --mdc-theme-text-hint-on-background is rgba(255,255,255,.5), which composites to
	// #9b9a9a on the #363535 background: 4.35:1, under the 4.5:1 SC 1.4.3 needs at 10px.
	// The secondary token is rgba(255,255,255,.7) -> #c4c3c3 -> 8.0:1.
	color: var(--mdc-theme-text-secondary-on-background);
}
```

**Step 2: Verify the ratio before trusting it**

```bash
node -e "
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const r=(a,b)=>((Math.max(L(a),L(b))+0.05)/(Math.min(L(a),L(b))+0.05)).toFixed(2);
console.log('old #9b9a9a on #363535 =', r('#9b9a9a','#363535'));
console.log('new #c4c3c3 on #363535 =', r('#c4c3c3','#363535'));
"
```

Expected: `old ... = 4.35`, `new ... = 8.05`.

**Step 3: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "fix(a11y): raise the home subtitle to AA contrast (was 4.35:1)"
```

---

### Task A5: Delete the unreferenced static files

**Objective:** Stop shipping 40 KB nothing loads.

**Files:**

- Delete: `static/~normalize.css/`, `static/~@fontsource/`

**Step 1: Prove they are unreferenced**

```bash
grep -rn "fontsource\|normalize" src/ svelte.config.js vite.config.ts package.json || echo "NO REFERENCES"
```

Expected: `NO REFERENCES`.

**Step 2: Delete and rebuild**

```bash
git rm -r 'static/~normalize.css' 'static/~@fontsource'
npm run build && npm run measure | head -5
```

Expected: build exit 0, SHARED unchanged at 1023 KB / 20 chunks.

**Step 3: Confirm nothing 404s**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/domain-search.spec.ts
```

Expected: PASS.

**Step 4: Commit**

```bash
git commit -m "chore: drop 40 KB of unreferenced ~normalize/~fontsource static files"
```

---

### Batch A gate

Run §5's full gate. Then spec review to **PASS**, then a separate fresh quality review to
**APPROVED**.

Batch A exit criteria: `tests/e2e/reflow.spec.ts` 7/7; axe reports **0** `color-contrast`
violations on `/`; the owner-address assertion passes; SHARED still 1023 KB / 20 chunks.

---

## Batch B — Semantics, status messages and focus

Fixes AC2, AC3, AC4, AC6, AC7.

### Task B1: Add axe-core and the failing a11y spec

**Objective:** Get a repeatable WCAG gate into the repo, failing on today's real violations.

**Files:**

- Modify: `package.json`, `package-lock.json`
- Create: `tests/e2e/a11y.spec.ts`

**Why plain `axe-core` and not `@axe-core/playwright`:** the wrapper declares its own
`@playwright/test` peer, and this repo pins 1.48.1 as an invariant. Injecting `axe.min.js` with
`page.addScriptTag` has no peer at all and is verified working against 1.48.1.

**Step 1: Install**

```bash
npm install --save-dev --save-exact axe-core@4.10.2
```

**Step 2: Write the spec**

```typescript
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
```

**Step 3: Run it and record the failures**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/a11y.spec.ts
```

Expected failures: `aria-input-field-name` on register and renew; 7 × `h1` count 0.
`color-contrast` should already be clean from Task A4. `heading-order` and `aria-allowed-role` are
`best-practice`, not in `TAGS`, and are handled by Tasks B2 and R4.

**Step 4: Commit**

```bash
git add package.json package-lock.json tests/e2e/a11y.spec.ts
git commit -m "test(a11y): add axe-core WCAG 2.2 AA gate across all seven routes"
```

---

### Task B2: Give every page an `h1` and a legal heading order

**Objective:** Clear `page-has-heading-one` on 7/7 routes and `heading-order` on 3.

**Files:**

- Modify: `src/routes/+page.svelte:11` — `h3` → `h1`
- Modify: `src/routes/profile/+page.svelte:57` — `h3` → `h1`; `:60` `h4` → `h2`
- Modify: `src/components/Domain.svelte:53` — `h5.domain` → `h1`; `:68`, `:107`, `:135`, `:161`
  `h5` → `h2`
- Modify: `src/routes/register/[name]/+page.svelte:109` — keep `h2`
- Modify: `src/components/DomainPayment.svelte:103` — `h4` → `h3`
- Modify: `src/routes/register/[name]/SubdomainRegistration.svelte:57` — `h4` → `h3`
- Modify: `src/routes/domain/[name]/transfer/+page.svelte:62` — `h4` → `h3`
- Modify: `src/routes/+error.svelte:12,15` — `h2` → `h1`

**Why the mapping is what it is:** `Domain.svelte` renders the domain name, which _is_ the subject
of `/domain/[name]` and `/tld`, so it becomes the `h1`; its four section labels drop to `h2`.
`DomainPayment`'s domain name sits under `/register`'s and `/renew`'s existing `h2 Register` /
`h2 Renew domain`, so it becomes `h3` — that closes the `h2 → h4` skip without renumbering the page.

**Watch the visual size.** `src/theme/typography.scss` maps `h1`…`h6` onto MDC's headline scale, so
`h5 → h1` would jump the domain name from `headline5` to `headline1`. Every element changed above
already carries an explicit `font-size` in its component's style block _except_ the section labels
in `Domain.svelte` and the error page. Add to `Domain.svelte`'s `.container h5` rule — now `h2` —
nothing; MDC's `headline2` is far too large. Instead pin the sizes:

```scss
/* in src/components/Domain.svelte, replacing the `h5` selector in `.container` */
h2 {
	margin: 0;
	margin-top: 1rem;
	text-align: start;
	// Kept at the old headline5 size on purpose: the level changed for screen readers,
	// the visual hierarchy did not.
	font-size: 1.25rem;
	font-weight: 800;
	word-wrap: break-word;
}
```

and update `.domain` (now the `h1`) to keep its `font-size: 1.8rem`.

**Step 1: Run the h1 tests, confirm 7 failures.**

**Step 2: Apply the changes above.**

**Step 3: Verify**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/a11y.spec.ts -g "level-one"
```

Expected: **7 passed**.

**Step 4: Verify nothing grew.** Re-run `tests/e2e/reflow.spec.ts` — 7/7. A heading that silently
became `headline1` would fail this immediately.

**Step 5: Commit**

```bash
git add src/routes src/components
git commit -m "fix(a11y): give every route one h1 and a heading order without skips"
```

---

### Task B3: Name the SMUI Select combobox

**Objective:** Clear `aria-input-field-name` (serious, SC 4.1.2) on `/register` and `/renew`, and
fix the same defect on the two Selects axe does not currently reach.

**Files:**

- Modify: `src/components/DomainPayment.svelte:122-127`
- Modify: `src/components/Records.svelte:71-77`
- Modify: `src/routes/profile/DomainsTable.svelte:97`

**Why:** SMUI 7's `Select` puts `role="combobox"` on `.mdc-select__anchor` and renders the label as
a sibling `.mdc-floating-label` without ever wiring `aria-labelledby`. The CDP AX tree confirms
`combobox name="" from=none` while the visible label says "Select Token". SMUI forwards
`anchor$*` props onto that element, which is the supported way in.

**Step 1: `DomainPayment.svelte`**

```svelte
					<Select
						bind:value={$selectedCoin}
						label="Select Token"
						variant="outlined"
						anchor$aria-label="Select Token"
						data-testid="payment-token-select"
					>
```

**Step 2: `Records.svelte`**

```svelte
			<Select
				class="mr-1 mobile--mt-1 mobile--mr-0 mobile--w-100"
				bind:value={selectedRecordClass}
				label="Select Type"
				anchor$aria-label="Select Type"
				invalid={selectRecordInvalid}
				variant="outlined"
			>
```

**Step 3: `DomainsTable.svelte`** — this one has `noLabel`, so there is no visible text to borrow:

```svelte
				<Select variant="outlined" bind:value={rowsPerPage} anchor$aria-label="Rows per page" noLabel>
```

**Step 4: Verify**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/a11y.spec.ts
```

Expected: `aria-input-field-name` gone from register and renew.

**Step 5: Commit**

```bash
git add src/components src/routes/profile/DomainsTable.svelte
git commit -m "fix(a11y): give every SMUI Select combobox an accessible name (SC 4.1.2)"
```

---

### Task B4: Mark invalid fields as invalid

**Objective:** Make the invalid state programmatically determinable, not just red.

**Files:**

- Modify: `src/routes/domain/[name]/transfer/+page.svelte:69-75`
- Modify: `src/routes/DomainSearch.svelte:68-76`
- Modify: `src/components/Records.svelte:83-90`
- Modify: `src/components/Record.svelte:75-83`

**Why:** with a bad recipient address the wrapper gets `mdc-text-field--invalid` and
`aria-describedby` resolves to "Address is invalid", but `aria-invalid` is **`null`**. SMUI's
`Textfield` does not set it. `input$*` forwards onto the real `<input>`.

**Step 1: Add the failing assertion** to `tests/e2e/a11y.spec.ts`:

```typescript
test('an invalid recipient address is programmatically invalid, not just red', async ({ page }) => {
	await page.goto('/domain/test.mpc/transfer', { waitUntil: 'networkidle' });
	const input = page.locator('.mdc-text-field input').first();
	await input.fill('nope');

	await expect(page.locator('.mdc-text-field')).toHaveClass(/mdc-text-field--invalid/);
	await expect(input).toHaveAttribute('aria-invalid', 'true');
});
```

Run it. Expected failure: `Expected attribute "aria-invalid" ... Received: <not present>`.

**Step 2: Forward the attribute at all four sites** — the pattern is identical:

```svelte
					<Textfield
						class="w-100"
						variant="outlined"
						bind:value={address}
						bind:invalid
						input$aria-invalid={invalid}
						label="Recipient address"
					>
```

For `Records.svelte` use `input$aria-invalid={recordValueInvalid}`, for `Record.svelte`
`input$aria-invalid={invalid}`, for `DomainSearch.svelte` `input$aria-invalid={invalid}`.

**Step 3: Verify** — the new test passes; `npm run test:unit` still 213.

**Step 4: Commit**

```bash
git add src/routes src/components tests/e2e/a11y.spec.ts
git commit -m "fix(a11y): set aria-invalid on invalid text fields (SC 4.1.2)"
```

---

### Task B5: Announce search results and loading states

**Objective:** SC 4.1.3. A screen-reader user who types a name must hear the answer.

**Files:**

- Modify: `src/routes/DomainSearch.svelte:91-127`
- Modify: `src/routes/domain/[name]/+page.svelte:75-83`

**Why:** the result card renders "test.mpc Registered" with **no** `aria-live` or
`role=status|alert|log` anywhere between it and `<body>`. And `/domain/[name]`'s spinner has neither
a `role` nor an `aria-label`, unlike `DomainSearch`'s at `:100`.

**Step 1: Add the failing assertion** to `tests/e2e/a11y.spec.ts`:

```typescript
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
```

Run it. Expected failure: `no aria-live / role=status ancestor`.

**Step 2: Wrap the three result branches in one live region** — one region that all three branches
render into, so the announcement is a content change rather than a region appearing:

```svelte
<div class="search-container">
	<form on:submit|preventDefault={submit}>
		<!-- unchanged -->
	</form>
	<!--
		One region, not one per branch: a `role="status"` element that is inserted into the DOM
		is announced unreliably, while a change of text inside a region that was already there
		is announced by every screen reader.
	-->
	<div role="status" aria-live="polite" aria-atomic="true">
		{#if isLoading}
			<Card class="domain-link">
				<CardContent>
					<div class="card-content">
						<span>{nameSearchedLabel}</span>
						<CircularProgress
							style="height: 32px; width: 32px;"
							indeterminate
							aria-label="Searching"
						/>
					</div>
				</CardContent>
			</Card>
		{:else if domain}
			<!-- unchanged registered branch -->
		{:else if domain === null}
			<!-- unchanged available branch -->
		{/if}
	</div>
</div>
```

**Step 3: Label the domain-page spinner** in `src/routes/domain/[name]/+page.svelte`:

```svelte
<div class="content domain">
	{#if !$domain}
		<div role="status">
			<CircularProgress
				style="height: 32px; width: 32px;"
				indeterminate
				aria-label="Loading domain"
			/>
		</div>
	{:else}
		<Domain domain={$domain} />
		<br />
		<GoBackButton />
	{/if}
</div>
```

**Step 4: Verify** — the new test passes, `tests/e2e/domain-search.spec.ts` still passes (the
`data-testid` selectors are unchanged), `tests/e2e/reflow.spec.ts` still 7/7.

**Step 5: Commit**

```bash
git add src/routes tests/e2e/a11y.spec.ts
git commit -m "fix(a11y): announce search results and loading states (SC 4.1.3)"
```

---

### Task B6: One visible focus ring, and honour reduced motion

**Objective:** Replace MDC's 1.53:1 background tint with a real, consistent focus ring, and stop
animating for users who asked not to be animated.

**Files:**

- Modify: `src/styles/theme-overrides.scss`

**Why:** every control does indicate focus today, so SC 2.4.7 (A) is met — but MDC does it with
`outline: none` plus a `::before` white overlay at .24 opacity, which on the header button is a
**1.53:1** change-of-contrast where SC 2.4.13 asks for 3:1, while native links keep the browser's
`outline: auto` ring. Two indicators, one of them barely visible. And `prefers-reduced-motion`
appears **zero** times in the app or the compiled theme, so ripples, spinners and menu transitions
run unconditionally.

**Step 1: Add the failing assertion** to `tests/e2e/a11y.spec.ts`:

```typescript
test('every focusable control gets a visible outline, not just a tint', async ({ page }) => {
	await page.goto('/domain/test.mpc', { waitUntil: 'networkidle' });
	await page.waitForTimeout(2000);

	for (const sel of ['a.link-logo', 'button.mdc-top-app-bar__action-item', 'button.chip']) {
		const el = page.locator(sel).first();
		await el.evaluate((n: HTMLElement) => n.focus());
		const outline = await el.evaluate((n) => {
			const cs = getComputedStyle(n);
			return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
		});
		expect(outline.style, sel).not.toBe('none');
		expect(outline.width, sel).toBeGreaterThanOrEqual(2);
	}
});
```

Run it. Expected failure on `button.mdc-top-app-bar__action-item`: `Received: "none"`.

**Step 2: Add the rules**

```scss
// Overrides for Material UI components
.mdc-icon-button:disabled {
	color: var(--mdc-theme-text-disabled-on-background);
}

// MDC signals focus with `outline: none` plus a ::before overlay at .24 opacity. On the header
// button that is #6849FE -> #8C75FE: a 1.53:1 change of contrast, against the 3:1 of WCAG 2.2
// SC 2.4.13, and a different indicator from the UA outline that native links still use. One ring
// for everything instead. `:focus-visible` keeps it off for pointer users, which is why MDC's
// overlay stays as-is underneath.
:focus-visible {
	outline: 3px solid var(--mdc-theme-secondary);
	outline-offset: 2px;
	border-radius: 2px;
}

// SC 2.3.3 and the spirit of 2.2.2: MDC ripples, the indeterminate spinners and the
// snackbar/menu transitions all animate unconditionally. Honour the OS setting.
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		scroll-behavior: auto !important;
	}
}
```

**Step 3: Verify the ring's contrast is real, not assumed**

`--mdc-theme-secondary` is `#d0c7ff`. Against the top app bar's `#6849fe`:

```bash
node -e "
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const r=(a,b)=>((Math.max(L(a),L(b))+0.05)/(Math.min(L(a),L(b))+0.05)).toFixed(2);
console.log('ring on app bar  #d0c7ff vs #6849fe =', r('#d0c7ff','#6849fe'));
console.log('ring on surface  #d0c7ff vs #212125 =', r('#d0c7ff','#212125'));
console.log('ring on bg       #d0c7ff vs #363535 =', r('#d0c7ff','#363535'));
"
```

Expected: all three ≥ 3.0. **If any is below 3.0, this task is not done** — pick a lighter token and
re-run before committing.

**Step 4: Add the reduced-motion assertion**

```typescript
test('reduced motion is honoured', async ({ browser }) => {
	const ctx = await browser.newContext({ reducedMotion: 'reduce' });
	const page = await ctx.newPage();
	await page.goto('/', { waitUntil: 'networkidle' });
	const duration = await page
		.locator('button.mdc-top-app-bar__action-item')
		.evaluate((n) => getComputedStyle(n).transitionDuration);
	expect(parseFloat(duration)).toBeLessThan(0.05);
	await ctx.close();
});
```

**Step 5: Commit**

```bash
git add src/styles/theme-overrides.scss tests/e2e/a11y.spec.ts
git commit -m "fix(a11y): one visible focus ring and prefers-reduced-motion support"
```

---

### Task B7: Fix the three wrong document strings

**Objective:** Tidy three small, provable wrongnesses.

**Files:**

- Modify: `src/routes/+error.svelte:7`
- Modify: `src/routes/tld/+page.svelte:23`
- Modify: `src/routes/+layout.svelte:30-31`

**Why:**

1. `<title>{$page.status}</title>` makes the browser tab and the history entry read `404`.
2. `/tld`'s title hardcodes `Meta | Meta Names` while the page body renders `config.tld` — `mpc`.
3. `snackbarMessage` and `snackbarTransactionMessage` are declared without initialisers, so Svelte
   renders the literal string `undefined` into both `.mdc-snackbar__label` elements. A closed
   snackbar is `display: none` so nobody sees it, but the initial content of a `role="status"`
   region should not be the word "undefined".

**Step 1: `+error.svelte`**

```svelte
<svelte:head>
	<title>{$page.status === 404 ? 'Not found' : 'Something went wrong'} | Meta Names</title>
</svelte:head>
```

**Step 2: `tld/+page.svelte`**

```svelte
<svelte:head>
	<title>{metaNamesConfig.tld} | Meta Names</title>
</svelte:head>
```

**Step 3: `+layout.svelte`**

```typescript
let snackbarTransactionMessage = '';
let snackbarMessage = '';
```

**Step 4: Verify**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/tld.spec.ts
node -e "0" # then check by hand:
```

Add to `tests/e2e/tld.spec.ts`:

```typescript
test('the title names the TLD the page shows', async ({ page }) => {
	await page.goto('/tld', { waitUntil: 'networkidle' });
	const heading = await page.locator('h1').textContent();
	await expect(page).toHaveTitle(`${heading?.trim()} | Meta Names`);
});
```

**Step 5: Commit**

```bash
git add src/routes tests/e2e/tld.spec.ts
git commit -m "fix(ux): correct the error and TLD page titles and the empty snackbar labels"
```

---

### Task B8: Remove the `autofocus` that does nothing

**Objective:** Delete a dead attribute, or make it real — decide, do not leave it ambiguous.

**Files:**

- Modify: `src/routes/DomainSearch.svelte:75`

**Why:** the `autofocus` prop lands on SMUI's **wrapper div**, not the `<input>`
(`inputHasAutofocusAttr: false`, `wrapperHasAutofocusAttr: true`), and `document.activeElement` is
`BODY` after load. It has never worked. Making it work is also the wrong call: auto-focusing on
load scrolls screen-reader and magnifier users past the header without warning, and this page's
`h1` is the thing they need first.

**Decision: delete it.** Remove the `autofocus` attribute from the `Textfield`.

**Step 1: Delete the attribute.**

**Step 2: Verify nothing depended on it**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test tests/e2e/domain-search.spec.ts
```

Expected: PASS — the specs type into the field explicitly.

**Step 3: Commit**

```bash
git add src/routes/DomainSearch.svelte
git commit -m "chore(a11y): drop the autofocus prop SMUI never forwarded to the input"
```

---

### Batch B gate

Run §5's full gate. Then spec review to **PASS**, then a separate fresh quality review to
**APPROVED**.

Batch B exit criteria: `tests/e2e/a11y.spec.ts` green on all 7 routes for
`wcag2a|wcag2aa|wcag21a|wcag21aa|wcag22aa`; 7 × exactly one `h1`; `aria-invalid`, live-region,
focus-ring and reduced-motion assertions all pass; reflow still 7/7; SHARED ≤ 1023 KB / ≤ 20 chunks.

---

## Batch C — `/domain/[name]` perceived speed

Fixes AC8 and the LCP half of AC9. Two tasks, deliberately ordered so the cheap, zero-risk one lands
first and the riskier one can be abandoned without losing it.

### Task C1: Reserve the card's space so the footer stops jumping

**Objective:** CLS 0.1492 → ≤ 0.02, with no change to how data is fetched.

**Files:**

- Modify: `src/routes/domain/[name]/+page.svelte` (style block)

**Why:** the 0.1406 shift at t=4023 ms names `DIV.content` and `FOOTER` as its sources. While only a
32 px spinner is on screen, `main` is short and the footer sits high; when the card renders the
footer is pushed down the page. Giving the container a floor removes the shift entirely and costs
nothing.

**Step 1: Add the failing assertion** — create `tests/e2e/perceived-speed.spec.ts`:

```typescript
import { expect, test } from '@playwright/test';

test('opening a domain page does not shove the layout around', async ({ page }) => {
	await page.addInitScript(() => {
		(window as unknown as { __cls: number }).__cls = 0;
		new PerformanceObserver((l) => {
			for (const e of l.getEntries() as (PerformanceEntry & {
				value: number;
				hadRecentInput: boolean;
			})[]) {
				if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
			}
		}).observe({ type: 'layout-shift', buffered: true });
	});

	await page.goto('/domain/test.mpc', { waitUntil: 'networkidle' });
	await page.waitForSelector('h1');
	await page.waitForTimeout(2000);

	const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
	expect(cls, `cumulative layout shift ${cls}`).toBeLessThanOrEqual(0.02);
});
```

Run it. Expected failure: `cumulative layout shift 0.14…`.

**Step 2: Give the container a floor**

```scss
.domain {
	width: 100%;
	max-width: 48rem;
	margin: 2rem 1rem;
	// The card is ~640px tall once the chain read lands. Without a floor the page is only
	// as tall as a 32px spinner until then, so the footer sits high and is shoved down when
	// the card arrives — one 0.1406 layout shift, 94% of this route's CLS.
	min-height: 32rem;
}
```

**Step 3: Verify** — the new test passes. Re-run `tests/e2e/reflow.spec.ts` (7/7) and
`tests/e2e/domain-management.spec.ts`.

**Step 4: Commit**

```bash
git add src/routes/domain/[name]/+page.svelte tests/e2e/perceived-speed.spec.ts
git commit -m "fix(perf): reserve the domain card's height to remove a 0.14 layout shift"
```

---

### Task C2: Revive a `Domain` from the API's JSON

**Objective:** Build and test the deserialisation C3 needs, on its own, before any route changes.

**Files:**

- Create: `src/lib/domain-dto.ts`
- Create: `src/lib/domain-dto.test.ts`

**Why:** `/api/domains/[name]` returns `{"domain":{"name":"test.mpc","tld":"mpc","createdAt":
"2024-10-17T15:16:35.092Z","expiresAt":"2125-09-23T15:16:35.092Z","owner":"0037…","tokenId":306,
"records":{"Price":"100"}}}` — dates as **ISO strings**. `Domain`'s constructor takes `IDomain`
with `createdAt: Date`, and `Domain.svelte:121` calls `formatDate(domain.expiresAt)`, which would
throw on a string. This is exactly the kind of thing that "works in dev, breaks on the page nobody
loaded" — so it gets its own test before it gets a caller.

**Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';
import { Domain } from '@metanames/sdk';

import { domainFromJSON } from './domain-dto';

const PAYLOAD = {
	name: 'test.mpc',
	tld: 'mpc',
	createdAt: '2024-10-17T15:16:35.092Z',
	expiresAt: '2125-09-23T15:16:35.092Z',
	owner: '00373c68dfed999aec39063194e2d3e0870f9899fa',
	tokenId: 306,
	records: { Price: '100' }
};

describe('domainFromJSON', () => {
	it('returns a real Domain, not a plain object', () => {
		const domain = domainFromJSON(PAYLOAD);
		expect(domain).toBeInstanceOf(Domain);
		expect(domain?.nameWithoutTLD).toBe('test');
	});

	it('revives the dates the API serialised as strings', () => {
		const domain = domainFromJSON(PAYLOAD);
		expect(domain?.createdAt).toBeInstanceOf(Date);
		expect(domain?.expiresAt).toBeInstanceOf(Date);
		expect(domain?.expiresAt?.getUTCFullYear()).toBe(2125);
	});

	it('keeps an absent expiry absent rather than inventing epoch zero', () => {
		const { expiresAt: _drop, ...noExpiry } = PAYLOAD;
		expect(domainFromJSON(noExpiry)?.expiresAt).toBeUndefined();
	});

	it('passes null straight through — a confirmed absence is not a failure', () => {
		expect(domainFromJSON(null)).toBeNull();
	});
});
```

```bash
npx vitest run src/lib/domain-dto.test.ts
```

Expected: FAIL — `Failed to resolve import "./domain-dto"`.

**Step 2: Write the implementation**

```typescript
import { Domain, type IDomain } from '@metanames/sdk';

/** The wire shape of `/api/domains/[name]` — `Domain.toJSON()` after `JSON.stringify`. */
export type DomainJSON = Omit<IDomain, 'createdAt' | 'expiresAt'> & {
	createdAt: string;
	expiresAt?: string;
};

/**
 * Rebuild a `Domain` from the API's JSON.
 *
 * `null` means the chain confirmed there is no such domain and must survive the round trip —
 * `loadOrReport`'s three-state contract depends on callers being able to tell "absent" from
 * "the read failed". Dates arrive as ISO strings and have to be revived: `Domain.svelte`
 * calls `formatDate(domain.expiresAt)`, which throws on a string.
 */
export function domainFromJSON(json: DomainJSON | null): Domain | null {
	if (json === null) return null;

	return new Domain({
		...json,
		createdAt: new Date(json.createdAt),
		expiresAt: json.expiresAt === undefined ? undefined : new Date(json.expiresAt)
	});
}
```

**Step 3: Run the test.** Expected: **4 passed**. Then `npm run test:unit` — expected **217 passed**.

**Step 4: Commit**

```bash
git add src/lib/domain-dto.ts src/lib/domain-dto.test.ts
git commit -m "feat(lib): revive a Domain model from the API's JSON payload"
```

---

### Task C3: Start the domain read during navigation instead of after hydration

**Objective:** LCP 4064 ms → under 2500 ms, by moving the read off the far side of hydration.

**Files:**

- Create: `src/routes/domain/[name]/+page.ts`
- Modify: `src/routes/domain/[name]/+page.svelte`

**Why:** today the read cannot start until ~1.5 MB of JS has downloaded, parsed and hydrated and
`onMount` has set `mounted = true`. A universal `load` runs on the server during SSR and, on
client-side navigation, starts as part of the navigation itself. The endpoint it calls already
exists and already performs this exact read.

**Careful — three things must not break:**

- The **lower-casing redirect** at `+page.svelte:42`. Move it into `load` so it happens before any
  fetch, not after one.
- The **`refresh` store subscription** at `:30`, which re-reads after a record is deleted. Keep it,
  and have it call `invalidateAll()` instead of its own `loadDomain`.
- The **three-state contract**: `null` → "register it now" redirect, read failure → home. `load`'s
  `fetch` must distinguish them.

**Step 1: Add the failing assertion** to `tests/e2e/perceived-speed.spec.ts`:

```typescript
test('the domain name is on screen before hydration finishes', async ({ page }) => {
	const response = await page.goto('/domain/test.mpc', { waitUntil: 'commit' });
	expect(response?.status()).toBe(200);
	// Server-rendered: the name is in the HTML, not painted in later by the client.
	expect(await response!.text()).toContain('test.mpc');
});
```

Run it. Expected failure — today the server sends a spinner.

**Step 2: Write the `load`**

```typescript
import { error, redirect } from '@sveltejs/kit';

import { domainFromJSON, type DomainJSON } from '$lib/domain-dto';

/**
 * Read the domain during navigation rather than after hydration.
 *
 * Before this, `+page.svelte` gated the read on `onMount`, so it could not start until ~1.5 MB
 * of JS had downloaded, parsed and hydrated: LCP 4064 ms on a throttled mobile, with the largest
 * paint being the header's "Connect Wallet" label until 4 s in.
 *
 * The lower-casing redirect moved here too. It used to fire after the component mounted, which
 * meant the un-normalised name was already in flight against the chain.
 */
export async function load({ params: { name }, fetch }) {
	const lowered = name.toLocaleLowerCase();
	if (lowered !== name) redirect(307, `/domain/${lowered}`);

	const response = await fetch(`/api/domains/${lowered}`);
	// A non-OK response means the read failed; it does not mean the domain is absent. Collapsing
	// the two would offer to register a domain because the network hiccuped.
	if (!response.ok) error(503, 'Could not load the domain. Please try again.');

	const { domain } = (await response.json()) as { domain: DomainJSON | null };
	// A confirmed absence is an invitation to register, exactly as before.
	if (domain === null) redirect(307, `/register/${lowered}`);

	return { domain: domainFromJSON(domain) };
}
```

**Step 3: Rewrite `+page.svelte`'s script**

```svelte
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	import CircularProgress from '@smui/circular-progress';
	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { refresh } from '$lib/stores/main';
	import type { PageData } from './$types';

	export let data: PageData;

	$: domain = data.domain;
	$: pageName = domain ? domain.name + ' | ' : '';

	// Deleting a record still has to re-read. `invalidateAll` re-runs the `load` above rather
	// than duplicating the fetch here.
	onMount(() =>
		refresh.subscribe((val) => {
			if (!val) return;

			void invalidateAll();
			refresh.set(false);
		})
	);
</script>
```

and the markup:

```svelte
<div class="content domain">
	{#if domain}
		<Domain {domain} />
		<br />
		<GoBackButton />
	{:else}
		<div role="status">
			<CircularProgress
				style="height: 32px; width: 32px;"
				indeterminate
				aria-label="Loading domain"
			/>
		</div>
	{/if}
</div>
```

**Step 4: Verify the redirects still behave.** `tests/e2e/domain-management.spec.ts` already covers
the unknown-domain redirect (`:39`). Run the whole domain surface:

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npx playwright test \
  tests/e2e/domain-management.spec.ts tests/e2e/dns-records.spec.ts \
  tests/e2e/perceived-speed.spec.ts tests/e2e/a11y.spec.ts
```

All must pass. **`dns-records.spec.ts` is the one that matters** — it exercises the `refresh` path
this task rewired.

**Step 5: Measure it**

```bash
npm run build && node scripts/measure-field-metrics.js /domain/test.mpc
```

Expected: LCP under 2500 ms, and the LCP element is `H1.domain`, not `SPAN.mdc-button__label`.

> `scripts/measure-field-metrics.js` does not exist yet — it is Task D1. If Batch D has not run,
> take the measurement by hand with the harness described there and paste the numbers into the
> batch report.

**Step 6: Commit**

```bash
git add src/routes/domain/[name] tests/e2e/perceived-speed.spec.ts
git commit -m "perf(domain): load the domain during navigation instead of after hydration"
```

---

### Batch C gate

Run §5's full gate. Then spec review to **PASS**, then a separate fresh quality review to
**APPROVED**.

Batch C exit criteria: CLS on `/domain/test.mpc` ≤ 0.02; LCP < 2500 ms with `H1.domain` as the LCP
element; `dns-records.spec.ts` and `domain-management.spec.ts` unchanged and green; unit ≥ 217.

**If Task C3's redirect semantics cannot be made to pass `dns-records.spec.ts` inside two attempts,
revert C3 alone** (`git revert` its commit), keep C1 and C2, record it under §8, and carry the LCP
work to Round 5. C1's CLS win does not depend on it.

---

## Batch D — The render-blocking stylesheet

The largest measured win in this audit (−728 ms FCP on every route) and the riskiest work in this
plan. It is therefore ordered **safety gate first, bytes second**, and it is explicitly allowed to
stop.

### Task D1: A repeatable field-metrics harness

**Objective:** Make the numbers in §3.3 reproducible with one command, so every later task in this
batch is measured rather than argued about.

**Files:**

- Create: `scripts/measure-field-metrics.js`
- Modify: `package.json` (add `measure:field`)

**Step 1: Write the script**

```javascript
#!/usr/bin/env node
/**
 * Field metrics against the real production build.
 *
 * Deliberately not a Playwright spec: `playwright.config.ts` boots the *dev* server, and dev
 * bundles are not what users download. Run `npm run build` first; this drives `vite preview`.
 *
 * Throttling matches the audit in docs/plans/2026-08-23-…-round-4.md §3.3 so numbers are
 * comparable across rounds: 1.6 Mbps / 750 kbps / 150 ms RTT, 4x CPU, 390x844 @ DPR 2.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.MEASURE_BASE ?? 'http://localhost:4173';
const RUNS = Number(process.env.MEASURE_RUNS ?? 3);
const ROUTES = process.argv.slice(2).length
	? process.argv.slice(2)
	: ['/', '/domain/test.mpc', '/register/zzunregistered123', '/profile', '/tld'];

const NET = {
	offline: false,
	downloadThroughput: (1.6 * 1024 * 1024) / 8,
	uploadThroughput: (750 * 1024) / 8,
	latency: 150
};

const OBSERVERS = `
  window.__lcp = 0; window.__lcpEl = null; window.__cls = 0; window.__lt = 0;
  new PerformanceObserver((l) => { for (const e of l.getEntries()) {
    window.__lcp = Math.round(e.startTime);
    window.__lcpEl = e.element ? e.element.tagName + (typeof e.element.className === 'string' && e.element.className ? '.' + e.element.className.trim().split(/\\s+/)[0] : '') : null;
  }}).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt += e.duration; })
    .observe({ type: 'longtask', buffered: true });
`;

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const browser = await chromium.launch();
const rows = [];

for (const route of ROUTES) {
	const runs = [];
	for (let i = 0; i < RUNS; i++) {
		const ctx = await browser.newContext({
			viewport: { width: 390, height: 844 },
			isMobile: true,
			hasTouch: true,
			deviceScaleFactor: 2
		});
		const page = await ctx.newPage();
		const cdp = await ctx.newCDPSession(page);
		await cdp.send('Network.enable');
		await cdp.send('Network.emulateNetworkConditions', NET);
		await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
		await page.addInitScript(OBSERVERS);
		await page.goto(BASE + route, { waitUntil: 'load', timeout: 120000 });
		await page.waitForTimeout(7000);
		runs.push(
			await page.evaluate(() => {
				const nav = performance.getEntriesByType('navigation')[0] ?? {};
				const res = performance.getEntriesByType('resource');
				const sum = (p) => res.filter(p).reduce((a, r) => a + (r.encodedBodySize || 0), 0);
				return {
					fcp: Math.round(
						performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint')
							?.startTime ?? 0
					),
					lcp: window.__lcp,
					lcpEl: window.__lcpEl,
					cls: Number(window.__cls.toFixed(4)),
					lt: Math.round(window.__lt),
					dcl: Math.round(nav.domContentLoadedEventEnd ?? 0),
					jsKB: Math.round(sum((r) => r.name.endsWith('.js')) / 1024),
					jsN: res.filter((r) => r.name.endsWith('.js')).length,
					cssKB: Math.round(sum((r) => r.name.endsWith('.css')) / 1024)
				};
			})
		);
		await ctx.close();
	}
	rows.push({
		route,
		fcp: median(runs.map((r) => r.fcp)),
		lcp: median(runs.map((r) => r.lcp)),
		lcpEl: runs[0].lcpEl,
		cls: median(runs.map((r) => r.cls)),
		lt: median(runs.map((r) => r.lt)),
		dcl: median(runs.map((r) => r.dcl)),
		jsKB: runs[0].jsKB,
		jsN: runs[0].jsN,
		cssKB: runs[0].cssKB
	});
}

await browser.close();

console.log(`Field metrics — 1.6 Mbps / 150 ms RTT / 4x CPU / 390x844, median of ${RUNS}\n`);
console.log(
	'route'.padEnd(32) +
		'FCP'.padStart(6) +
		'LCP'.padStart(7) +
		'CLS'.padStart(9) +
		'longTask'.padStart(10) +
		'jsKB'.padStart(7) +
		'jsN'.padStart(5) +
		'cssKB'.padStart(7) +
		'  LCP element'
);
for (const r of rows) {
	console.log(
		r.route.padEnd(32) +
			String(r.fcp).padStart(6) +
			String(r.lcp).padStart(7) +
			String(r.cls).padStart(9) +
			String(r.lt).padStart(10) +
			String(r.jsKB).padStart(7) +
			String(r.jsN).padStart(5) +
			String(r.cssKB).padStart(7) +
			'  ' +
			r.lcpEl
	);
}
```

**Step 2: Wire it up**

```bash
npm pkg set scripts."measure:field"="node scripts/measure-field-metrics.js"
```

**Step 3: Reproduce the baseline**

```bash
npm run build
npx vite preview --port 4173 &
sleep 5
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run measure:field
kill %1
```

Expected: FCP within ±15 % of §3.3 for each route. **If it is not, stop and reconcile before
touching any CSS** — an unreproducible baseline makes the rest of this batch meaningless.

> `vite preview` binds `localhost` and answers on both `::1` and `127.0.0.1`, but a harness that
> hardcodes `127.0.0.1` hit `ECONNREFUSED ::1:4173` in Round 3. Use `localhost`.

**Step 4: Commit**

```bash
git add scripts/measure-field-metrics.js package.json
git commit -m "chore(perf): add a reproducible throttled field-metrics harness"
```

---

### Task D2: The safety gate — a computed-style regression snapshot

**Objective:** Build the thing that makes CSS removal safe, **before** removing anything.

**Files:**

- Create: `scripts/snapshot-computed-styles.js`
- Create: `docs/plans/2026-08-23-round-4-style-snapshot.json` (generated, committed)
- Modify: `package.json` (add `snapshot:styles`)

**Why:** §3.4's caveat, restated as executable policy. Chromium coverage cannot see JS-applied state
classes, so any coverage-driven trim risks silently breaking a focus ring, an open menu or an
invalid field. This script walks every route **and every interactive state we can drive**, records
the computed value of a fixed property list for every element, and diffs against a committed
snapshot. A trim that changes one pixel of rendered style fails here.

**Step 1: Write the script**

```javascript
#!/usr/bin/env node
/**
 * Computed-style snapshot across every route and every state we can drive.
 *
 * This is the gate that makes CSS removal safe. Chromium's CSS coverage only sees rules that
 * matched during a traversal, and MDC applies most of its interesting classes from JavaScript —
 * mdc-ripple-upgraded--background-focused, mdc-snackbar--open, mdc-menu-surface--open,
 * mdc-text-field--invalid, mdc-select--activated. A coverage-driven trim that looks safe will
 * quietly delete those. So: drive the states, record what the browser actually computes, and
 * require a byte-identical result afterwards.
 *
 * Usage:  node scripts/snapshot-computed-styles.js            # write the snapshot
 *         node scripts/snapshot-computed-styles.js --check    # diff against the committed one
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.SNAPSHOT_BASE ?? 'http://localhost:4173';
const OUT = 'docs/plans/2026-08-23-round-4-style-snapshot.json';
const CHECK = process.argv.includes('--check');

const PROPS = [
	'display',
	'position',
	'width',
	'height',
	'margin',
	'padding',
	'border',
	'border-radius',
	'color',
	'background-color',
	'opacity',
	'visibility',
	'font-size',
	'font-weight',
	'line-height',
	'text-align',
	'text-transform',
	'outline',
	'box-shadow',
	'transform',
	'z-index',
	'overflow',
	'flex-direction',
	'justify-content',
	'align-items',
	'gap'
];

const VIEWPORTS = [
	['desktop', 1440, 900],
	['mobile', 375, 667],
	['narrow', 320, 568]
];

const ROUTES = [
	'/',
	'/domain/test.mpc',
	'/register/zzunregistered123',
	'/profile',
	'/tld',
	'/domain/test.mpc/renew',
	'/domain/test.mpc/transfer'
];

/** Drive the states MDC only reaches from JavaScript. Each returns a label or null if N/A. */
const STATES = [
	['rest', async () => 'rest'],
	[
		'focus-header',
		async (page) => {
			const b = page.locator('button.mdc-top-app-bar__action-item');
			if (!(await b.count())) return null;
			await b.first().focus();
			await page.waitForTimeout(300);
			return 'focus-header';
		}
	],
	[
		'menu-open',
		async (page) => {
			const b = page.locator('button.mdc-top-app-bar__action-item');
			if (!(await b.count())) return null;
			await b.first().click();
			await page.waitForTimeout(600);
			return 'menu-open';
		}
	],
	[
		'field-invalid',
		async (page) => {
			const i = page.locator('.mdc-text-field input');
			if (!(await i.count())) return null;
			await i.first().fill('!!!not valid!!!');
			await page.waitForTimeout(500);
			return 'field-invalid';
		}
	],
	[
		'select-open',
		async (page) => {
			const s = page.locator('.mdc-select__anchor');
			if (!(await s.count())) return null;
			await s.first().click();
			await page.waitForTimeout(500);
			return 'select-open';
		}
	]
];

const capture = (props) =>
	`(() => {
		const props = ${JSON.stringify(props)};
		const out = [];
		let i = 0;
		for (const el of document.querySelectorAll('body *')) {
			const cs = getComputedStyle(el);
			const key = el.tagName.toLowerCase() + '#' + (i++) +
				(typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).sort().join('.') : '');
			out.push(key + '|' + props.map((p) => cs.getPropertyValue(p)).join('|'));
		}
		return out;
	})()`;

const browser = await chromium.launch();
const snapshot = {};

for (const [vp, width, height] of VIEWPORTS) {
	for (const route of ROUTES) {
		for (const [stateName, drive] of STATES) {
			const ctx = await browser.newContext({
				viewport: { width, height },
				isMobile: vp !== 'desktop',
				hasTouch: vp !== 'desktop',
				reducedMotion: 'reduce' // kill transitions so nothing is captured mid-animation
			});
			const page = await ctx.newPage();
			await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
			await page.waitForTimeout(2500);
			const label = await drive(page);
			if (label === null) {
				await ctx.close();
				continue;
			}
			snapshot[`${vp}|${route}|${stateName}`] = await page.evaluate(capture(PROPS));
			await ctx.close();
		}
	}
}

await browser.close();

if (!CHECK) {
	fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 1));
	const n = Object.values(snapshot).reduce((a, v) => a + v.length, 0);
	console.log(`wrote ${OUT}: ${Object.keys(snapshot).length} scenes, ${n} elements`);
	process.exit(0);
}

const expected = JSON.parse(fs.readFileSync(OUT, 'utf8'));
let diffs = 0;
for (const key of new Set([...Object.keys(expected), ...Object.keys(snapshot)])) {
	const a = expected[key] ?? [];
	const b = snapshot[key] ?? [];
	if (a.length !== b.length) {
		console.error(`${key}: element count ${a.length} -> ${b.length}`);
		diffs++;
		continue;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			console.error(`${key}\n  before: ${a[i]}\n  after:  ${b[i]}`);
			if (++diffs > 40) {
				console.error('… truncated');
				process.exit(1);
			}
		}
	}
}
console.log(diffs === 0 ? 'computed styles identical' : `${diffs} computed-style differences`);
process.exit(diffs === 0 ? 0 : 1);
```

**Step 2: Wire it up**

```bash
npm pkg set scripts."snapshot:styles"="node scripts/snapshot-computed-styles.js"
```

**Step 3: Prove the gate actually catches something**

Write the snapshot, then deliberately break one rule and confirm `--check` fails:

```bash
npm run build && npx vite preview --port 4173 & sleep 5
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run snapshot:styles
# tamper: delete the mdc-button rules from the built stylesheet
CSS=$(ls .svelte-kit/output/client/_app/immutable/assets/0.*.css)
cp "$CSS" /tmp/css.bak
node -e "const fs=require('fs');const f=process.argv[1];fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace(/\.mdc-button\{[^}]*\}/g,''))" "$CSS"
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run snapshot:styles -- --check; echo "exit=$?"
cp /tmp/css.bak "$CSS"
```

Expected: `exit=1` with concrete before/after lines. **A gate that cannot fail is not a gate — if
this step exits 0, the script is wrong and the batch stops here.**

**Step 4: Regenerate a clean snapshot and confirm it passes**

```bash
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run snapshot:styles -- --check; echo "exit=$?"
```

Expected: `exit=0`, `computed styles identical`.

**Step 5: Commit**

```bash
git add scripts/snapshot-computed-styles.js package.json docs/plans/2026-08-23-round-4-style-snapshot.json
git commit -m "chore(css): add a computed-style regression gate across routes and states"
```

---

### Task D3: Drop the checkbox styles the app cannot render

**Objective:** The first real byte removal, chosen because it is the one we can argue for from the
source rather than from coverage: **22 KB (6.2 %)** of `mdc-checkbox`.

**Files:**

- Create: `scripts/prune-theme-css.js`
- Modify: `package.json` (`generate:themes` runs the prune after `smui-theme-dark`)

**Why this block and no other:** `@smui/checkbox` is **not** in `package.json`. It reaches the theme
only as a transitive dependency of `@smui/data-table`, whose row-selection feature
`src/routes/profile/DomainsTable.svelte` does not use — it renders `Head`/`Body`/`Row`/`Cell` and a
`Pagination`, and no `Checkbox`. `grep -rn "Checkbox" src/` returns nothing. This is a source-level
argument, not a coverage inference, which is what makes it safe to go first.

**Step 1: Prove the premise**

```bash
grep -rn "Checkbox\|checkbox" src/ || echo "NO CHECKBOX IN SOURCE"
node -e "console.log(Object.keys(require('./package.json').devDependencies).filter(k=>k.includes('checkbox')))"
```

Expected: `NO CHECKBOX IN SOURCE` and `[]`.

**Step 2: Write the prune script**

```javascript
#!/usr/bin/env node
/**
 * Remove component blocks from the generated SMUI theme.
 *
 * `smui-theme compile` emits the styles of every installed @smui package plus their transitive
 * deps into one file, which lands render-blocking in the layout chunk on every route: 361 KB raw,
 * 35 KB gzip, and the sole determinant of FCP (see the round-4 plan §3.4).
 *
 * Everything listed here must be justified from *source*, never from coverage. Coverage cannot
 * see the classes MDC applies from JavaScript, so "unmatched" does not mean "unused". Each entry
 * carries the grep that proves the component is unreachable.
 *
 * Guarded by `npm run snapshot:styles -- --check`, which fails on any computed-style change.
 */
import fs from 'node:fs';

const TARGET = 'src/styles/theme/smui-dark.css';

const PRUNE = [
	{
		// @smui/checkbox is not a declared dependency; it arrives under @smui/data-table for row
		// selection, which DomainsTable.svelte does not use. `grep -rn Checkbox src/` is empty.
		prefix: 'mdc-checkbox',
		reason: '@smui/checkbox is transitive via @smui/data-table; no Checkbox is rendered'
	}
];

const css = fs.readFileSync(TARGET, 'utf8');

/** Split into top-level rules, tracking brace depth so @media blocks stay whole. */
function topLevelRules(text) {
	const rules = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '{') {
			if (depth === 0) rules.push({ selectorEnd: i, from: start });
			depth++;
		} else if (text[i] === '}') {
			depth--;
			if (depth === 0) {
				rules[rules.length - 1].to = i + 1;
				start = i + 1;
			}
		}
	}
	return rules.filter((r) => r.to !== undefined);
}

const rules = topLevelRules(css);
const kept = [];
const removed = {};

for (const rule of rules) {
	const selector = css.slice(rule.from, rule.selectorEnd);
	const hit = PRUNE.find((p) => selector.includes(p.prefix));
	if (hit && !selector.includes('@')) {
		removed[hit.prefix] = (removed[hit.prefix] ?? 0) + (rule.to - rule.from);
		continue;
	}
	kept.push(css.slice(rule.from, rule.to));
}

const out = kept.join('');
fs.writeFileSync(TARGET, out);

console.log(`prune-theme-css: ${css.length} -> ${out.length} bytes`);
for (const [prefix, bytes] of Object.entries(removed)) {
	console.log(`  -${(bytes / 1024).toFixed(1)} KB  ${prefix}`);
}
if (Object.keys(removed).length !== PRUNE.length) {
	console.error(
		'a PRUNE entry matched nothing — the theme changed shape, review before trusting this'
	);
	process.exit(1);
}
```

Note the `!selector.includes('@')` guard: `@media` and `@keyframes` blocks are left alone entirely,
because removing one would take unrelated rules with it.

**Step 3: Wire it into the theme build**

```bash
npm pkg set scripts."generate:themes"="npm run smui-theme-dark && node scripts/prune-theme-css.js"
```

**Step 4: Rebuild and check the gate**

```bash
npm run build
ls -l .svelte-kit/output/client/_app/immutable/assets/0.*.css
npx vite preview --port 4173 & sleep 5
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run snapshot:styles -- --check; echo "exit=$?"
kill %1
```

Expected: stylesheet ~347 KB (down ~22 KB), and **`exit=0`**.

**If the gate fails, revert this task and stop Batch D.** A 22 KB win is not worth a rendering
regression, and a failure here means the premise — that no checkbox is reachable — was wrong.

**Step 5: Measure**

```bash
npx vite preview --port 4173 & sleep 5
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run measure:field /
kill %1
```

Record FCP. Expected: a small improvement, roughly 30–60 ms — 22 KB raw is ~2 KB gzip, so most of
the win is parse, and **the honest expectation is that this task alone does not move FCP much.** It
exists to prove the pipeline and the gate on a block we can defend from source.

**Step 6: Commit**

```bash
git add scripts/prune-theme-css.js package.json
git commit -m "perf(css): drop 22 KB of mdc-checkbox styles the app cannot render"
```

---

### Task D4: Inline the stylesheet if it now fits

**Objective:** Remove the render-blocking **request**, which §3.4 shows is worth far more than the
bytes.

**Files:**

- Modify: `svelte.config.js` (`inlineStyleThreshold`)

**Why:** the contention experiment is unambiguous — the same 35 KB stylesheet takes 880 ms with the
JS fan-out competing and 351 ms without, and FCP tracks it 1:1. A stylesheet inlined into the HTML
has no request to lose that race. SvelteKit's `inlineStyleThreshold` does exactly this and is
currently `4096`.

**Step 1: Check whether it fits**

```bash
npm run build
wc -c .svelte-kit/output/client/_app/immutable/assets/0.*.css
```

**Decision rule, applied honestly:**

- If the stylesheet is **≤ 40 KB raw**, raise the threshold above it and continue to Step 2.
- If it is still hundreds of KB — which, after Task D3 alone, **it will be** — then **do not raise
  the threshold**. Inlining 347 KB into every HTML response trades a cacheable 25 KB brotli request
  for 347 KB of uncacheable HTML on every navigation, which is worse for repeat visits and worse
  for TTFB. Record the number, skip to Step 4, and carry the remaining work to Round 5 as
  **D-deferred** in §7.

This task is written to be skipped. Skipping it is a result, not a failure.

**Step 2 (only if it fits): raise the threshold**

```javascript
		inlineStyleThreshold: 40960,
```

**Step 3 (only if it fits): verify and measure**

```bash
npm run build
curl -s http://localhost:4173/ | grep -c "rel=\"stylesheet\""   # expect fewer than 4
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run snapshot:styles -- --check
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run measure:field
```

**Step 4: Record the outcome either way**

Append the measured stylesheet size and the decision to the batch report, then:

```bash
git add svelte.config.js 2>/dev/null; git commit --allow-empty -m "perf(css): record the inline-threshold decision for the layout stylesheet"
```

---

### Batch D gate

Run §5's full gate, plus:

```bash
npx vite preview --port 4173 & sleep 5
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run snapshot:styles -- --check
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run measure:field
kill %1
```

Then spec review to **PASS**, then a separate fresh quality review to **APPROVED**.

Batch D exit criteria: `snapshot:styles --check` exits 0; `measure:field` reproduces or improves on
§3.3 for every route; SHARED ≤ 1023 KB / ≤ 20 chunks; the batch report states the stylesheet's
size before and after and the FCP delta, **including if the delta is zero**.

---

## 6. Batch summary

| Batch                       | Tasks | Touches                                                                       | Risk                                    | Measured payoff                                                                           |
| --------------------------- | ----- | ----------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| **A** — reflow and contrast | A1–A5 | CSS + one markup attribute in 3 files, `static/` deletions                    | Very low                                | SC 1.4.10 on 2 routes, SC 1.4.3 on 1, chip values readable, −40 KB deploy                 |
| **B** — semantics and focus | B1–B8 | headings, ARIA attributes, one live region, `theme-overrides.scss`            | Low                                     | 4 axe rules cleared on 7 routes, SC 4.1.2 ×2, SC 4.1.3, a 3:1+ focus ring, reduced motion |
| **C** — `/domain` speed     | C1–C3 | one style rule, one new lib module, one new `+page.ts`, one component rewrite | **Medium** (C3 changes a redirect path) | CLS 0.149 → ≤ 0.02, LCP 4064 → < 2500 ms                                                  |
| **D** — render-blocking CSS | D1–D4 | two new scripts, `generate:themes`, possibly `svelte.config.js`               | **Medium-high**, gated                  | −22 KB proven; the −728 ms ceiling stays measured but mostly unclaimed                    |

Total: 20 tasks, 4 gates, 8 reviews.

---

## 7. Rejected and deferred

Each entry says what the evidence was and why the answer is still no.

### Rejected

| #   | Item                                                                                 | Evidence                                                                                                                       | Why rejected                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Add a skip link                                                                      | No skip link exists; `Tab` from load reaches `a.link-logo`, then the connect button, then `<main>`'s first control             | SC 2.4.1 Bypass Blocks targets _repeated blocks of content_. Two focusable elements precede `<main>` on every route. A skip link here adds a control most users will never need and one more thing to style; the measured tab order is already two keystrokes to content.                                                                                                     |
| R2  | Make `autofocus` on the search field actually work                                   | `wrapperHasAutofocusAttr: true`, `inputHasAutofocusAttr: false`, `activeElement === BODY`                                      | Fixing it would be a regression for accessibility: auto-focus on load moves screen-reader and magnifier users past the header and the new `h1` without warning. Task B8 deletes the attribute instead.                                                                                                                                                                        |
| R3  | Restyle the testnet dev-private-key panel (`#999` on `#1a1a2e`, `#4ecdc4` button)    | `WalletConnectButton.svelte:234-288`; rendered only when `config.environment === 'test'`                                       | Never reaches a production user. Spending an AA budget on a developer affordance is the wrong trade.                                                                                                                                                                                                                                                                          |
| R4  | Fix `aria-allowed-role` — `role="toolbar"` on `.mdc-top-app-bar__section--align-end` | axe minor, best-practice tag, 7/7 routes                                                                                       | Emitted by SMUI's `<Section toolbar>`; removing the prop changes MDC's layout, and overriding the attribute means fighting the component. Not in any WCAG tag, minor impact, and the section contains exactly one control. Not worth touching SMUI's output for.                                                                                                              |
| R5  | Fix the undefined `--mdc-theme-on-background` in `Footer.svelte:41`                  | The variable is defined **nowhere** — `grep -c` over the compiled theme returns 0                                              | Measured the actual result rather than assuming: the declaration is invalid at computed-value time, the footer inherits `rgb(255,255,255)` on `rgb(54,53,53)` — **12.3:1**, comfortably AA. It works by accident, but it works, and changing it risks a visual regression for zero user gain. Noted here so the next reader does not "fix" it into a real bug.                |
| R6  | Merge shared chunks to reduce the 29-request JS fan-out                              | Delaying all `_app/immutable/**/*.js` by 1200 ms cuts the stylesheet's fetch 880 → 351 ms and FCP 1152 → 624 ms                | The contention is real and measured, but the remedy is forbidden by this round's constraints: merging chunks is reshaping that leaves the initial route payload unchanged. It also trades parallelism and cache granularity for one metric. Batch D attacks the same 690 ms from the CSS side instead, where the payload genuinely shrinks.                                   |
| R7  | Purge the stylesheet down to the 22 KB the A/B measured                              | Coverage: 22,182 / 369,595 bytes matched (6.0 %)                                                                               | The 6 % is an upper bound, not a shopping list. A static traversal never enters `mdc-ripple-upgraded--background-focused`, `mdc-snackbar--open`, `mdc-menu-surface--open`, `mdc-text-field--invalid` or `mdc-select--activated`, so a coverage-driven purge would delete live rules. Task D3 removes only what the _source_ proves unreachable. The rest is D-deferred below. |
| R8  | Debounce the home search by request rather than by render                            | `DomainSearch.svelte:32` fires a chain read 400 ms after every keystroke pause; `requestId` guards the render, not the request | Real inefficiency, but no measured user-visible cost: the stale-response guard is correct, reads are cheap, and the observable behaviour is right. Changing it would be an optimisation with no metric behind it, which is the opposite of this round's rule.                                                                                                                 |

### Deferred to Round 5

| #   | Item                                                                            | Evidence                                                                                                                                                                                         | Why deferred, not rejected                                                                                                                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-a | Split the SMUI theme so route-specific component CSS is not in the layout chunk | Byte attribution in §3.4: `mdc-text-field` 32 KB, `mdc-select` 30 KB, `mdc-data-table` 11 KB, `mdc-dialog` 8 KB, `mdc-tab` 9 KB — ~90 KB that most routes never use                              | The win is real but route-dependent, and `smui-theme compile` emits one monolith, so realising it means a splitter keyed on MDC component boundaries plus per-component `@import`s in the Svelte files. That is a batch of its own. Task D2's snapshot gate is the prerequisite, and this plan builds it. |
| D-b | The remaining ~330 KB of the render-blocking stylesheet                         | §3.4 A/B: −728 ms FCP available; Task D3 claims ~22 KB of it                                                                                                                                     | Gated on D-a and on a coverage harness that drives interactive states (which D2 half-builds). Doing it blind is R7.                                                                                                                                                                                       |
| D-c | `/register/[name]`'s 3224 ms LCP                                                | Same post-hydration read shape as `/domain`, via `fetchApiJson` at `+page.svelte:78`                                                                                                             | Batch C proves the `+page.ts` pattern on `/domain` first. `/register` is harder: its load has a three-way branch (already registered → redirect, parent missing → redirect, otherwise render) that a `load` must reproduce exactly. Move it once the simpler case has shipped and been reviewed.          |
| D-d | `@sentry/core` ~50 KB eagerly on `/renew` and `/transfer`                       | Round 3 residual: `OafcN4pz.js` (53 `@sentry` modules) is statically imported by nodes 4 and 5 — the only two routes with a client `+page.ts` — via `sentrySvelteKit`'s `autoInstrument` wrapper | Removing it means `autoInstrument: false` and hand-wiring instrumentation, which trades observability for 50 KB on two low-traffic routes. **Note for whoever picks this up: Task C3 adds a third `+page.ts`, so `/domain/[name]` will start carrying this chunk too.** Re-measure before deciding.       |
| D-e | Browser-level crypto vectors against the production build                       | Round 3 residual: `crypto-shim.spec.ts` imports through Vite's dev-only `/@id/` prefix, so it is excluded from preview runs; production evidence is static-graph analysis only                   | Real gap, but it is a test-harness problem in the crypto area this round is forbidden to touch (Invariant 1). Keep it visible.                                                                                                                                                                            |
| D-f | `.svelte-kit/tsconfig.json` churn                                               | `svelte-kit sync` drops the tracked `env.d.ts` include line on every run                                                                                                                         | Recurring noise in `git status` at every gate. The fix is to untrack the generated file, which is a repo-hygiene change with its own review. Until then: `git checkout -- .svelte-kit/tsconfig.json` before committing.                                                                                   |

---

## 8. Risks, rollback and errata

### Risks

| Risk                                                                                                         | Likelihood                                                                     | Blast radius                                                    | Mitigation                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task B2's heading changes inherit MDC's `headline1`–`headline3` sizes and blow up the layout                 | **High** — `src/theme/typography.scss` maps every `h1`–`h6` onto the MDC scale | Visual, every route                                             | B2 pins explicit `font-size` on every element it re-levels, and B2 Step 4 re-runs the reflow spec, which fails immediately on an oversized heading                                                                                                                                                                                                |
| Task C3's `load` changes redirect semantics and breaks the record-deletion refresh                           | Medium                                                                         | `/domain/[name]`, the most-visited route                        | C3 keeps the three-state contract explicit in code and comments, moves the lower-casing redirect _before_ the fetch, and gates on `dns-records.spec.ts`, which is the spec that exercises `refresh`. Batch C's exit criteria say to revert C3 alone after two failed attempts.                                                                    |
| Task C3's `load` runs during SSR and makes the server wait on a chain read, hurting TTFB                     | Medium                                                                         | `/domain/[name]`                                                | The endpoint it calls already does this read server-side for `/register`, so the latency is not new to the deployment. Measure TTFB with `measure:field` before and after; if TTFB regresses by more than 200 ms, add `export const ssr = false` to the new `+page.ts` and re-measure — that keeps the navigation-time win and drops the SSR one. |
| Task D3's prune removes a rule something reaches through a class the snapshot never drove                    | Medium                                                                         | Visual, potentially subtle                                      | D2 is built and proven-to-fail _before_ D3 runs. D3 removes only a block the _source_ proves unreachable. D3 Step 4 says to revert and stop Batch D on any gate failure.                                                                                                                                                                          |
| `prune-theme-css.js` runs inside `generate:themes`, so it mutates a gitignored generated file on every build | Certain, by design                                                             | Build reproducibility                                           | The script is idempotent (a second run finds nothing to prune and exits 1 with a clear message, which is the intended tripwire if the theme changes shape) and `src/styles/theme/smui-dark.css` is gitignored, so the source of truth stays `smui-theme compile`                                                                                  |
| `axe-core` as a new devDependency drifts and starts reporting new rules, breaking CI                         | Low                                                                            | Batch gates                                                     | Installed with `--save-exact` at 4.10.2                                                                                                                                                                                                                                                                                                           |
| B4's `input$aria-invalid={invalid}` renders `aria-invalid="false"` rather than omitting it                   | Low                                                                            | None functionally — `aria-invalid="false"` is valid and correct | Noted so a reviewer does not file it as a bug                                                                                                                                                                                                                                                                                                     |

### Rollback

Every task is one commit. To undo a task:

```bash
git revert --no-edit <sha>
npm run check && npm run lint && npm run test:unit && npm run build
PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright npm run test:integration
```

To undo a whole batch, revert its commits newest-first. The batches are independent by design:

- **A** is CSS and static-file deletion — reverting it costs nothing else.
- **B** depends on A only for `color-contrast` being clean; reverting A re-adds one axe violation
  that B's spec will then catch. Revert B first if reverting both.
- **C1/C2** are independent of everything. **C3** depends on **C2**; revert C3 before C2.
- **D3/D4** depend on **D2** existing. **D1** and **D2** are pure additions and safe to keep even if
  D3 is reverted.

Nothing in this plan is pushed, so `git reset --hard 003f301` remains available as the floor.

### Plan-defect errata policy

This plan is wrong somewhere. When you find it:

1. **Do not silently improvise.** A task that cannot be executed as written is a defect in the plan,
   not a licence to redesign it mid-flight.
2. **Append to the "Errata" section below** — new heading `### E<n>: <task id> — <one line>`, then
   what the plan asserted, what was actually true (with the command and its output), and what you
   did instead.
3. **Commit the erratum as its own `docs(plan):` commit**, before or alongside the code change it
   justifies. Round 3 set this precedent with `003f301`, which rejected a planned step as a plan
   defect and shipped nothing else.
4. **If the defect invalidates a batch's rationale** — for example, if `measure:field` cannot
   reproduce §3.3 — stop the batch, write the erratum, and escalate rather than proceeding on
   numbers you no longer believe.
5. **Numbers in this plan are measurements, not targets.** If a re-measurement disagrees with §3,
   the erratum records the disagreement; it does not adjust the plan to match the more convenient
   number.

---

## Errata

### E1: A3 — the min-content floor is in `Domain.svelte`, not `Chip.svelte`

**What the plan asserted.** Task A3 names exactly one file, `src/components/Chip.svelte`, and
predicts **7 passed** on `tests/e2e/reflow.spec.ts` after Steps 1–2.

**What was actually true.** With Steps 1 and 2 applied verbatim and nothing else changed, the spec
still failed on `/domain`, and failed _wider_ than the baseline A1 pinned:

| `/domain` doc `scrollWidth` @ 320 px viewport | source                                      |
| --------------------------------------------- | ------------------------------------------- |
| 339 px                                        | §3.3 and A1 Step 2, at `bab1d37`            |
| **373 px**                                    | A3 Steps 1–2 as written, `Chip.svelte` only |
| ≤ 320 px — **7 passed**                       | shipped `414c379`, re-run to confirm        |

`domain: 373px of content in a 320px viewport`. The step meant to fix the failure moved it 34 px
the wrong way.

**Root cause.** `min-width: 0` on `.value` frees the chip's own text to shrink; it does not free
the flex ancestors between that text and the card. In `Domain.svelte`, `.container` is a column
flex container with `align-items: start`, which sizes each `.section` to `fit-content` — and
`fit-content` is floored at `min-content`. `.section` and `.chips` both keep the default
`min-width: auto`, so the widest nowrap chip set the subtree's min-content width and pushed
`documentElement.scrollWidth` past the viewport no matter what `Chip.svelte` permitted. Step 1's
replacement of `.value.ellipsis`'s hard `width: 100px` with `max-width: min(28ch, 60vw)` — correct
on its own merits, and the whole point of Step 4's desktop assertion — _raised_ that floor, which
is why the number went 339 → 373 instead of down.

**What was done instead.** `414c379` ships Steps 1–4 as written, plus the two corrections the plan
omits:

- `src/components/Domain.svelte`, a file A3's **Files** list does not mention:
  `.section { align-self: stretch; min-width: 0; }` and `.chips { min-width: 0; }`. Stretching the
  section to the card drops the `fit-content` sizing; the two `min-width: 0` declarations drop the
  `min-width: auto` floor.
- `src/components/Chip.svelte`, beyond Step 2's `max-width: 100%`: `min-width: 0` on `.container`
  and on `:global(.mdc-button__label)`. `mdc-button` is itself a flex container and its label a
  flex item, so both carry the same `auto` floor and would have held the chip open at the value's
  full text width, defeating the `max-width`.

**Scope.** A3's objective, gates and commit message stand; only the file list and the two style
steps were wrong. No other task is affected — A2 had already taken `/register` green at `66d8ac8`,
and nothing outside `/domain/[name]`'s chip subtree changed.

### E2: A4 — the `.7` white composite is `#c3c2c2` at 6.9:1, not `#c4c3c3` at 8.05:1

**What the plan asserted.** Task A4 Step 1's comment and Step 2's snippet both name `#c4c3c3` as the
composite of `--mdc-theme-text-secondary-on-background` (`rgba(255,255,255,.7)`) over `#363535`, and
Step 2 states `Expected: ... new ... = 8.05`.

**What was actually true.** Both halves of that prediction are off — the hex by one step per channel,
the ratio by 1.1:

| `rgba(255,255,255,.7)` on `#363535`   | hex       | ratio  |
| ------------------------------------- | --------- | ------ |
| A4 Step 1 comment and Step 2 expected | `#c4c3c3` | 8.05:1 |
| browser composited `getComputedStyle` | `#c3c2c2` | 6.88:1 |
| A4's own Step 2 snippet on `#c4c3c3`  | `#c4c3c3` | 6.95:1 |

So the plan disagrees with itself: run its snippet on the hex it predicts and the answer is 6.95,
not the 8.05 the same step tells you to expect. The measured value is lower again, because the real
composite is `#c3c2c2`.

**Root cause.** Two independent slips, neither of which the plan's own verification step would have
caught if its expected value had been trusted over its output. The hex is a rounding error in the
`.7`-over-`#363535` composite — `0.7*255 + 0.3*0x36` is 195.4, which truncates to `0xc3`, not the
`0xc4` the plan carries. The `8.05` is an arithmetic error in the expected value only; the snippet
itself is correct (sRGB threshold `0.03928`, exponent `2.4`, channels at offsets 1/3/5) and was
never the source of that number.

**What was done instead.** `1a5ab16` ships Step 1's one-line `color:` change exactly as written — the
token is unchanged, so the fix and its commit message stand — with the comment corrected to the
measured values: `#9b9a9a` at 4.36:1 for the old hint token, `#c3c2c2` at 6.88:1 for the new
secondary one. Per errata policy item 5, Task A4's text above is left as written; this entry records
the disagreement rather than retrofitting the plan to the measurement.

**Scope.** The conclusion is unaffected: 6.88:1 clears the 4.5:1 that SC 1.4.3 requires at 10 px, so
A4 still takes the app's one `color-contrast` violation to zero and Task B's assumption that
`color-contrast` is clean still holds. Nothing outside the `.subtitle` rule changed. The overstated
8.05 was never a gate — no task asserts a contrast ratio above AA.

---

## Appendix A: audit method

So the numbers can be reproduced or disputed.

- **Build under test:** `npm run build` at `003f301`, exit 0, served by `npx vite preview` on
  `localhost`. Not the dev server — dev bundles are not what users download. Note `vite preview`
  binds `localhost` and answers on both `::1` and `127.0.0.1`; a harness hardcoding `127.0.0.1` hit
  `ECONNREFUSED ::1:4173` in Round 3.
- **Browser:** Chromium via the pinned `@playwright/test` 1.48.1 with
  `PLAYWRIGHT_BROWSERS_PATH=/opt/data/.playwright`. The separately-installed `playwright` 1.58.2
  resolves to a browser revision that is not downloaded here and fails with
  `Executable doesn't exist at .../chromium_headless_shell-1208/`.
- **Throttling:** CDP `Network.emulateNetworkConditions` (1.6 Mbps down, 750 kbps up, 150 ms RTT)
  and `Emulation.setCPUThrottlingRate` (4×), viewport 390 × 844, `isMobile`, DPR 2.
- **Metrics:** `PerformanceObserver` on `largest-contentful-paint`, `layout-shift` (excluding
  `hadRecentInput`) and `longtask`; `performance.getEntriesByType('paint')` for FCP;
  `encodedBodySize` for transfer sizes. Perf tables are single-run unless a median is stated; every
  A/B is median-of-3.
- **Accessibility:** `axe-core` 4.10.2 injected with `page.addScriptTag`, tags `wcag2a, wcag2aa,
wcag21a, wcag21aa, wcag22aa, best-practice`, 7 routes × 3 viewports. Accessible names read from
  the CDP `Accessibility.getFullAXTree`, not inferred from markup.
- **CSS coverage:** `page.coverage.startCSSCoverage()` across all 7 routes in one session.
- **Contrast:** WCAG relative-luminance formula on the browser's own composited `getComputedStyle`
  values, cross-checked against axe's `color-contrast` output.
- **Scratch tooling:** `axe-core` was installed into `/tmp` during the audit, not into the repo, so
  `git status` stayed clean at `003f301` throughout. Task B1 is the first commit that adds it as a
  dependency.
