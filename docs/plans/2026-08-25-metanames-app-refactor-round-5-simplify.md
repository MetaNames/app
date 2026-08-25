# MetaNames App Refactor Plan — Round 5: Simplification & Production Readiness

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
> One conventional commit per task. Run the batch gates at every task boundary.
> Do not push — the controller pushes once at the end.

**Goal:** Reduce duplication and move untestable logic out of components while fixing the three
real production-readiness defects found by audit (server error-message leak, unchecked
`getAccountBalance` response, missing `{:catch}` on the money-path fee fetch).

**Architecture:** SvelteKit 2 SPA-with-SSR on Vercel, Svelte 4, SMUI 7. Pure logic lives in
`src/lib/*.ts` under Vitest (coverage thresholds 98/94/99/98 hold); browser/chain flows under
Playwright. This round changes no crypto, no signing path, no transaction construction.

**Tech Stack:** SvelteKit 2.55 · Svelte 4.2 · TypeScript strict · Vitest 2.1 · Playwright **1.48.1
(pinned)** · npm only.

**Baseline:** `f30a5aa` on `staging`. Gates at baseline: lint ✅ · typecheck ✅ (0/0) · unit ✅
243 passed / 29 files · coverage 100% stmts / 97.21% branch.

---

## Invariants (hold after EVERY task)

1. **Crypto/signing untouched.** No changes to signing strategy internals, transaction
   construction, or key handling. `src/lib/node-compat/**` may only gain comments/deletions of
   dead forwarders listed in Task A6 — nothing else.
2. **Bundle gate:** `npm run measure` must report **≤ 1023 KB across ≤ 20 chunks** at each batch
   boundary. Extracted lib modules are tree-shakeable ES modules; do not add dependencies.
3. **Coverage thresholds not lowered** (`vite.config.ts` test.coverage.thresholds). No test
   deleted or skipped. New lib code ships with tests (TDD).
4. **`loadOrReport` three-state contract survives** (null = chain says no such domain,
   undefined = read failed). Task A3 must preserve both call-site semantics.
5. **Evidence-backed inline comments are preserved verbatim** when moving code (measured CLS,
   measured KB, dev-failure rationale). If code moves, its comment moves with it.
6. **Playwright stays at 1.48.1.**
7. **Prettier + ESLint clean** — `npm run lint` part of every gate.
8. Before committing: `git checkout -- .svelte-kit/tsconfig.json` (known sync churn, D-d in
   Round 4 errata).
9. All commits stay local on `staging`. Controller pushes at the end.

## Batch gates (run after each task)

```bash
git checkout -- .svelte-kit/tsconfig.json   # before git add
npm run lint && npm run typecheck && npm run test:unit
```

At batch boundaries additionally:

```bash
npm run build && npm run measure    # ≤1023 KB / ≤20 chunks
```

---

## Batch A — lib correctness & deduplication

### Task A1: Fix `handleError` info leak and status mapping in server/index.ts

**Objective:** Stop echoing internal `error.message` to API clients; return 500 for unexpected
errors; merge the near-duplicate `apiError` helper.

**Files:**
- Modify: `src/lib/server/index.ts`
- Test: `src/lib/server/index.test.ts` (create if absent — check first)

**Step 1: Failing tests** (new/updated): an `Error('secret internal detail')` thrown inside
`handleError` produces `status 500`, body `{"error":"Internal Server Error"}` and does NOT contain
the secret; an `HttpError`-shaped `{ status, body.message }` still maps through; `apiError` callers
migrated to the merged helper.

**Step 2:** Verify fail. **Step 3:** Implement one `jsonError(status, message)` +
`handleError` that distinguishes expected domain errors (keep their safe messages/status) from
unexpected `Error` (log via `reportError`/console, respond 500 generic). Preserve existing public
response shapes used by `tests/e2e/*` — grep them first. **Step 4:** gates green.
**Step 5:** Commit `fix(server): stop leaking internal error messages to API clients`.

### Task A2: Harden `getAccountBalance` in wallet.ts

**Objective:** A GraphQL error payload must surface as a clean Error, not a TypeError.

**Files:**
- Modify: `src/lib/wallet.ts:44-56`
- Test: `src/lib/wallet.test.ts`

**Step 1: Failing tests:** mock fetch returning (a) `!response.ok`, (b) `{ errors: [...] }`,
(c) `{ data: null }` → each yields `Error('Balance lookup failed')`-style clean message instead of
TypeError. Existing success path unchanged. **Step 2:** verify fail. **Step 3:** add `response.ok`
check + `data?.data?.account` guard. **Step 4:** gates green. **Step 5:** Commit
`fix(wallet): handle failed balance lookups without a TypeError`.

### Task A3: One `reportAndAlert(error, fallbackMessage)` error path

**Objective:** Collapse the console.error → reportError → alertMessage.set sequence repeated in
utils.ts, loaders/read catch paths, api.ts.

**Files:**
- Modify: `src/lib/error.ts` (add helper), `src/lib/utils.ts`, `src/lib/read.ts`, `src/lib/api.ts`
- Test: `src/lib/error.test.ts`

**Constraints:** `loadOrReport`'s null-vs-undefined contract untouched — only its catch *body*
dedupes. Sentry stays lazy (helper calls the existing lazy reporter, never imports Sentry eagerly).
Keep each site's exact fallback message text so e2e assertions don't shift; grep `tests/e2e` for
the strings first and list them in the commit body.

**Steps:** failing test for the helper (spy store + fake reporter) → implement → swap call sites
one file per commit is allowed but one commit total is fine → gates → Commit
`refactor(lib): unify the report-and-alert error path`.

### Task A4: Move `alertTransactionAndFetchResult` from utils.ts to transaction.ts

**Objective:** utils.ts holds only pure helpers.

**Files:** Modify `src/lib/utils.ts`, `src/lib/transaction.ts`, `src/lib/index.ts` (barrel),
import sites (`grep -rn alertTransactionAndFetchResult src --include='*.svelte'`). Move function +
its tests verbatim (comment included). Update barrel re-export so `$lib` consumers unchanged.
Commit `refactor(lib): relocate transaction alerting beside its subject`.

### Task A5: config.ts env map + sdk.ts record-list cleanup

**Objective:** Kill 4 repeated ternaries and the `'00'` magic string; make record lists honest.

**Files:** Modify `src/lib/config.ts`, `src/lib/url.ts`, `src/lib/sdk.ts`; tests co-located.
- config.ts: derive `{ rpcUrl, explorerUrl, sdkEnvironment, ... }` from one
  `TESTNET | MAINNET` record; name the account-prefix constant
  `ACCOUNT_ADDRESS_HEX_PREFIX = '00'` in url.ts with a comment.
- sdk.ts: drop the no-op `.map((v) => RecordClassEnum[v])`; switch `socialRecords` /
  `profileRecords` to the **string key names** consumers compare against
  `Object.keys(domain.records)` (verify Domain.svelte:32-33 semantics identical before/after —
  write a characterization test first if any doubt).

Commit `refactor(lib): single environment table and honest record-key lists`.

### Task A6: Annotate domain-dto.ts as intentionally retained; micro-prune node-compat

**Objective:** Record WHY dead-looking code stays (audit flagged both).

**Files:** Modify `src/lib/domain-dto.ts` (header comment: retained per Round 4 E10/E11 —
C3 aborted but the DTO contract is documented and tested; revisit on next route consumer),
`src/lib/node-compat/bip39.ts` (annotate `mnemonicToSeed` async forwarder as API-parity-only,
no current caller), `src/lib/node-compat/lazy-crypto.ts` (mark `isWalletCryptoLoaded` test-only).

No behavior change; tests untouched. Commit `docs(lib): annotate deliberately-retained DTO and shim members`.

---

## Batch B — component refactors

### Task B1: Shared `trackLatest()` race-guard helper

**Objective:** Replace 4 hand-rolled requestId guards.

**Files:**
- Create: `src/lib/race.ts` + `src/lib/race.test.ts`
- Modify: `src/routes/DomainSearch.svelte`, `src/routes/domain/[name]/+page.svelte`,
  `src/routes/register/[name]/+page.svelte`, `src/routes/profile/+page.svelte` (and
  SubdomainRegistration.svelte's unguarded parent lookup — adopt the guard there too, closing the
  interleaving gap the page already documents)

**API:** `const latest = trackLatest(); ... if (!latest.check(id)) return;` — design the minimal
shape from actual call sites; keep each site's existing comment about why the guard exists.
Also clear `DomainSearch`'s `debounceTimer` on destroy (audit finding) and remove the
`eslint-disable no-unused-vars` smell. TDD the helper. Commit
`refactor(ui): one race-guard helper replaces four hand-rolled copies`.

### Task B2: Extract wallet-connect orchestration → lib/wallet-connect.ts

**Objective:** WalletConnectButton.svelte script shrinks to view concerns; flows become testable.

**Files:**
- Create: `src/lib/wallet-connect.ts` + `src/lib/wallet-connect.test.ts`
- Modify: `src/routes/WalletConnectButton.svelte:29-129`

**Design:** data-driven table `[{ label, connect(): Promise<SigningStrategy-ish>, getAddress() }]`
per wallet; one exported `connectWallet(kind)` orchestrating the shared
sdk-update → set-signing → get-address → set-store sequence. Mock the seams (sdk store, wallet
store) in tests. Preserve Sentry reporting semantics including deliberate non-reporting of
private-key failures (comment moves too). Add disabled/loading guard on the trigger item while
connecting (double-click fix, audit finding). Fix the dev-key input's missing accessible label.
Do NOT rename the `connectedMenuIems` slot (paired with WalletConnectStatus) — add a comment.
Commit `refactor(wallet): extract connect flows into testable lib module`.

### Task B3: Purify DomainPayment fee flow + error state

**Objective:** Money math becomes pure lib functions; failed fee fetch shows an error state.

**Files:**
- Create: `src/lib/payment-fees.ts` + `src/lib/payment-fees.test.ts`
- Modify: `src/components/DomainPayment.svelte:43-88,137-150`

**Steps:** extract `computeTotalFees(fees, years)` (pure) and `assertSufficientBalance(balance,
total)`; component keeps zero fee arithmetic. Replace impure `totalFeesLabel()` render call.
Add `{:catch}` branch rendering an error state with retry (match app's existing error styling)
and handle `fees === null`. Characterization tests first against current math. Commit
`fix(payment): pure fee computation and a visible failure state`.

### Task B4: Config-driven chips in Domain.svelte

**Objective:** Collapse the 4-deep nested profile-chips block and its duplicate social block.

**Files:** Modify `src/components/Domain.svelte:69-104,133-148` (+ small local helper or
extend Records/sort lib if it fits). Build one `chipGroups` derivation
(`{label, value, href?, kind}`) consumed by a single `{#each}`; kill `klass === 'Uri'/'Price'`
special-casing. Visual output must be DOM-equivalent (e2e a11y + domain specs are the oracle).
Commit `refactor(domain): declarative chip groups replace nested conditionals`.

### Task B5: Stop prop mutation (Records + DomainsTable)

**Objective:** Child components never mutate props.

**Files:** Modify `src/components/Records.svelte:60` (insert → dispatch/reassign pattern consistent
with Svelte 4), `src/components/Records.svelte:31-34` (declare validator above its dependent),
`src/routes/profile/DomainsTable.svelte:24-46` (sort returns new array via extended
`src/lib/sort.ts` util `paginateSorted(items, sortKey, asc, page, rowsPerPage)` — TDD in
sort.test.ts; drop self-reassign hack). Fix Record.svelte dialog ARIA refs
(`confirmation-title`/`confirmation-content` ids) and give the "No" button an explicit close
action if SMUI requires it — verify manually in e2e run. Commit
`refactor(records): immutable updates and correct dialog wiring`.

### Task B6: Extract SnackbarHost from +layout.svelte

**Files:**
- Create: `src/components/SnackbarHost.svelte`
- Modify: `src/routes/+layout.svelte:28-68,131-155`

Move snackbar pair + timer restart logic (the earned comment moves verbatim) + onDestroy cleanup.
Layout subscribes/wraps. Behavior identical incl. 5 s timer rule. Commit
`refactor(layout): snackbar host becomes its own component`.

### Task B7: Dedupe transfer/renew page scaffolding

**Files:** Modify `src/routes/domain/[name]/transfer/+page.svelte:44-49`,
`src/routes/domain/[name]/renew/+page.svelte:36-41` — one `onLoadErrorRedirect(data)` helper
(lib or shared route module `_shared.ts`) replacing both identical onMount blocks. Also dedupe
the fees SCSS shared with SubdomainRegistration into a shared stylesheet import. Commit
`refactor(domain): shared load-error redirect and fee styles`.

### Task B8: A11y sweep (remaining audit findings)

**Files:** register page spinner gets `role="status"` wrapper; DomainsTable sort headers get
`aria-sort`; Chip copy success/failure announced via `role="status"` ping; `+error.svelte` two
branches collapse to one. Extend `tests/e2e/a11y.spec.ts` expectations where cheap.
Commit `fix(a11y): close the remaining audit gaps`.

---

## Final verification (controller runs)

```bash
npm run lint && npm run typecheck && npm run test:unit
npm run build && npm run measure   # ≤1023 KB / ≤20 chunks
npx playwright test                 # if env permits; else record blocker
```

Then push: use repo-specific push command (PAT askpass), then `gh run list/watch` until CI green.

## Deliberately out of scope

- Deleting domain-dto.ts (kept per Round 4 E10) — annotated instead (A6)
- Removing/reshaping node-compat layer (load-bearing for bundle tripwire)
- `validAddress` regex tightening (behavior risk, zero observed bugs — raise separately)
- Svelte 5, CSP, SMUI replacement, dependency upgrades (Round 4 exclusions carry over)
