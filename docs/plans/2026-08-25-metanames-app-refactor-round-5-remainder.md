# MetaNames App Refactor Plan — Round 5 Remainder (B1 + aria-sort)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.
> One conventional commit per task. Run the batch gates at every task boundary.
> Do not push — the controller pushes once at the end.

**Goal:** Finish the two remaining Round 5 items — the shared `trackLatest()` race-guard
helper (Task B1, never executed) and the `aria-sort` attribute on DomainsTable's sort
headers (the one B8 item still missing) — so `staging` can be pushed and CI verified.

**Architecture:** SvelteKit 2 SPA-with-SSR on Vercel, Svelte 4, SMUI 7. Pure logic lives in
`src/lib/*.ts` under Vitest; browser/chain flows under Playwright. No crypto, no signing
path, no transaction construction is touched.

**Tech Stack:** SvelteKit 2.55 · Svelte 4.2 · TypeScript strict · Vitest 2.1 · Playwright
1.48.1 (pinned) · npm only.

**Baseline:** `da38443` on `staging`. Gates at baseline: lint ✅ · typecheck ✅ · unit ✅
(243+ passed). CI on `61fc33c` was red only on Integration Tests (e2e), fixed locally by
`da38443` but not yet pushed.

---

## Invariants (hold after EVERY task)

1. **Crypto/signing untouched.** No changes to signing strategy internals, transaction
   construction, or key handling (`src/lib/node-compat/**` untouched).
2. **Bundle gate:** `npm run measure` must report **≤ 1023 KB across ≤ 20 chunks** at each
   batch boundary. No new dependencies.
3. **Coverage thresholds not lowered** (`vite.config.ts` test.coverage.thresholds). No test
   deleted or skipped. New lib code ships with tests (TDD).
4. **`loadOrReport` three-state contract survives** (null = chain says no such domain,
   undefined = read failed).
5. **Evidence-backed inline comments are preserved verbatim** when moving code. If code
   moves, its comment moves with it.
6. **Playwright stays at 1.48.1.**
7. **Prettier + ESLint clean** — `npm run lint` part of every gate.
8. Before committing: `git checkout -- .svelte-kit/tsconfig.json` (known sync churn).
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

### Task R1: Shared `trackLatest()` race-guard helper

**Objective:** Replace the four hand-rolled `requestId` counters with one tested helper,
and close the unguarded parent lookup in SubdomainRegistration.

**Files:**

- Create: `src/lib/race.ts`, `src/lib/race.test.ts`
- Modify:
  - `src/routes/DomainSearch.svelte` (~line 20: `let requestId = 0;`; guard at ~55;
    also add `onDestroy(() => clearTimeout(debounceTimer))` and drop the
    `eslint-disable no-unused-vars` on `debounce`)
  - `src/routes/profile/+page.svelte` (~20/~30/~37)
  - `src/routes/register/[name]/+page.svelte` (~23/~65/~80)
  - `src/routes/domain/[name]/+page.svelte` (~16/~48/~55)
  - `src/routes/register/[name]/SubdomainRegistration.svelte` (~26: unguarded
    `loadOrReport` of the parent domain — adopt the guard)
- Barrel export from `src/lib/index.ts` if the existing barrel pattern covers lib modules
  (check how `sort.ts` / `filter.ts` are exported first; follow that pattern).

**API (minimal, derived from actual call sites):**

```ts
// src/lib/race.ts
export interface LatestTracker {
	/** Call before starting async work; returns this attempt's id. */
	next(): number;
	/** True when this attempt is still the newest one. */
	check(id: number): boolean;
}
export function trackLatest(): LatestTracker {
	let latest = 0;
	return {
		next: () => ++latest,
		check: (id: number) => id === latest
	};
}
```

If a simpler shape fits all five call sites better (e.g. a two-function closure returning
ids), prefer it — but keep it dependency-free and fully typed.

**Step 1: Failing tests** in `src/lib/race.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { trackLatest } from './race';

describe('trackLatest', () => {
	it('issues increasing ids', () => {
		const t = trackLatest();
		expect(t.next()).toBe(1);
		expect(t.next()).toBe(2);
	});

	it('accepts only the newest id and rejects superseded ones', () => {
		const t = trackLatest();
		const first = t.next();
		t.next();
		expect(t.check(first)).toBe(false);
		expect(t.check(t.next())).toBe(true);
	});

	it('starts fresh per instance (no shared state)', () => {
		const a = trackLatest();
		a.next();
		expect(trackLatest().next()).toBe(1);
	});
});
```

**Step 2:** Run `npx vitest run src/lib/race.test.ts` → FAIL (module not found).

**Step 3:** Implement `trackLatest()` as above; swap each route's hand-rolled counter:

- `let requestId = 0;` + `const currentRequestId = ++requestId;` +
  `if (currentRequestId !== requestId) return;`
  becomes `const latest = trackLatest();` + `const currentId = latest.next();` +
  `if (!latest.check(currentId)) return;`
- Keep each site's explanatory comment verbatim (e.g. profile's "Switching wallets starts
  a second lookup…" comment, domain page's null-vs-undefined redirect comments).

**Step 4:** Run `npx vitest run src/lib/race.test.ts` → PASS; then full unit suite → PASS.

**Step 5:** Batch gates green, then commit:
`refactor(ui): one race-guard helper replaces four hand-rolled copies`

---

### Task R2: `aria-sort` on DomainsTable sortable headers

**Objective:** The remaining B8 audit item: sortable column headers must expose their sort
state (`aria-sort="ascending" | "descending"` on the sorted column, none/absent on the
other).

**Files:**

- Modify: `src/routes/profile/DomainsTable.svelte` (~lines 37–58: the `<Cell columnId=…>`
  header cells for `tokenId` and `name`)
- Test: extend `tests/e2e/a11y.spec.ts` if a cheap assertion fits (a11y walk already
  covers the route; a targeted assertion like `expect(header).toHaveAttribute('aria-sort')`
  on the active column is enough — skip extending if it requires new fixtures).

**Implementation notes:**

- SMUI `Cell` forwards arbitrary attrs to its host element, so
  `cell$aria-sort={columnId === sort ? (sortDirection === 'ascending' ? 'ascending' : 'descending') : undefined}`
  on each sortable Cell should land on the `<th>` — verify in the rendered DOM during e2e
  or via component test; if the `cell$` prefix does not forward, fall back to an
  `aria-sort` attr binding directly supported by SMUI's Cell (check
  `node_modules/@smui/data-table` Cell.svelte for its forwarded-attrs convention).
- Reactive statement: `$: ariaSort = (col: string) => col === sort ? (sortDirection === 'ascending' ? 'ascending' : 'descending') : undefined;`

**Steps:** implement → `npm run lint && npm run typecheck && npm run test:unit` green →
extend a11y spec cheaply if possible → commit:
`fix(a11y): expose aria-sort on DomainsTable sortable headers`

---

## Final verification (controller runs)

```bash
npm run lint && npm run typecheck && npm run test:unit
npm run build && npm run measure   # ≤1023 KB / ≤20 chunks
```

Then push staging once (repo-specific PAT askpass), then `gh run list/watch` until CI
green. Integration tests are globally exclusive and touch the shared MPC testnet — a red
run there after these changes means a real regression or environment flake, investigate
before re-running.

## Deliberately out of scope

Everything else from the round-5 plan (already committed) plus the standing exclusions
(Svelte 5, CSP, SMUI replacement, dep upgrades, validAddress regex).
