# MetaNames App - Integration Tests Status

> Last updated: 2026-03-19 20:04 UTC
> Branch: `integration-tests`
> CI: GitHub Actions (unit + integration tests)

---

## Progress

| Feature | Status | Stories | Notes |
|---------|--------|---------|-------|
| Feature 1: Domain Search | ✅ Done | 3 | Merged into `integration-tests` |
| Feature 2: Wallet Connection | ❌ Skipped | - | Cannot test browser extensions in Playwright |
| Feature 3: Domain Registration | ✅ Written | 6 | E2E tests with data-testid selectors |
| Feature 4: Domain Management | ✅ Written | 4 | E2E tests |
| Feature 5: Domain Renewal | ✅ Written | 2 | E2E tests |
| Feature 6: Domain Transfer | ✅ Written | 2 | E2E tests |
| Feature 7: DNS Records | ✅ Done | 4 | Tests pass with proper async waiting |
| Feature 8: User Profile | ✅ Written | 6 | E2E tests |
| Feature 9: API Endpoints | ✅ Written | 7 | Depends on testnet SDK connectivity |
| ~~Feature 10: Proposals~~ | ❌ Removed | - | Feature not in use — DO NOT add tests for proposals |

**Total:** 34 stories | **Written:** 34

---

## ⚠️ DO NOT Test

- **Proposals** — Feature is not in use. Do not write unit or integration tests for `src/lib/proposal.ts` or proposals pages.
- **Wallet Connection (browser extensions)** — Cannot be tested in Playwright. Requires manual testing.

---

## CI Configuration

- **Unit Tests:** `npm run test:unit` (vitest)
- **Integration Tests:** `npm run test:integration` (Playwright)
- **CI runs on:** push/PR to `main` and `integration-tests` branches
- **Secrets required:** `TESTNET_PRIVATE_KEY` (GitHub repo secret)
- **Package manager:** npm (not pnpm — SMUI theme breaks with pnpm's strict node_modules)

---

## Test File Inventory

```
tests/
├── e2e/
│   ├── domain-search.spec.ts        Feature 1 (3 tests)
│   ├── domain-registration.spec.ts  Feature 3 (6 tests)
│   ├── domain-management.spec.ts    Feature 4 (4 tests)
│   ├── domain-renewal.spec.ts       Feature 5 (2 tests)
│   ├── domain-transfer.spec.ts      Feature 6 (2 tests)
│   ├── dns-records.spec.ts          Feature 7 (4 tests)
│   └── profile.spec.ts             Feature 8 (6 tests)
└── api/
    ├── domains.spec.ts              Feature 9 (4 tests)
    └── fees.spec.ts                 Feature 9 (3 tests)
```

---

## Known Issues

- `@partisiablockchain/abi-client` is CJS — uses default import pattern in `proposal.ts` for SSR compat
- `contractAbi.getStateStruct is not a function` — SDK issue, affects API tests that hit the contract
- SMUI theme requires npm (flat node_modules) — pnpm breaks `@use '@material/theme/...'` resolution

---

## Environment Requirements

- `TESTNET_PRIVATE_KEY`: Required for wallet signing tests
- Node.js 20+
- npm
- Playwright browsers: `npx playwright install --with-deps chromium`
