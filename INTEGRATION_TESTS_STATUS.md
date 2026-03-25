# MetaNames App - Integration Tests Status

> Last updated: 2026-03-24 16:01 UTC
> Branch: `integration-tests`
> CI: GitHub Actions (unit + integration tests)
> **Status: ✅ ALL COMPLETE — 56/56 tests passing**

---

## ✅ All Features Complete

| Feature | Status | Tests | Notes |
|---------|--------|-------|-------|
| Feature 1: Domain Search | ✅ Pass | 3 | Search, validation, availability status |
| Feature 2: Wallet Connection | ❌ Skipped | - | Cannot test browser extensions in Playwright |
| Feature 3: Domain Registration | ✅ Pass | 9 | Checkout, tokens, years, subdomain, redirect, auth |
| Feature 4: Domain Management | ✅ Pass | 4 | Full page load, non-existent redirect, owner TabBar, non-owner |
| Feature 5: Domain Renewal | ✅ Pass | 3 | Page load + controls, URL, auth payment/fees |
| Feature 6: Domain Transfer | ✅ Pass | 5 | Page load + warnings, URL, ConnectionRequired, auth, validation |
| Feature 7: DNS Records & Settings | ✅ Pass | 7 | Tabs, records, add form, Renew/Transfer links, edit flow, tab switching |
| Feature 8: User Profile | ✅ Pass | 5 | Disconnected state, address chip, domains table, search, navigation |
| Feature 9: API Endpoints | ✅ Pass | 8 | Domain check, details, recent, stats, fees |
| ~~Feature 10: Proposals~~ | ❌ Removed | - | Feature not in use |
| Blockchain Ops | ✅ Pass | 4 | Register domain, add/edit/delete record (sequential, no retry) |
| TLD Page | ✅ Pass | 3 | Domain card, Whois, no settings tab |
| DevWalletPanel | ✅ Pass | 4 | Open, login, disconnect, invalid key rejection |

**Total:** 56 tests | **Passing:** 56 | **Failing:** 0

---

## Test Architecture

### Shared Helpers (`tests/e2e/helpers.ts`)
- `loginOnCurrentPage(page)` — Login via DevWalletPanel on the current page (no navigation)
- `loginAtHome(page)` — Login at homepage
- `spaNavigate(page, path)` — Client-side goto() preserving Svelte stores

### Key Pattern: Login on Current Page
`page.goto()` does a full reload → clears Svelte stores. Always navigate first, then login.

### Refactoring Principles Applied
- **No redundant tests** — domain page structure (avatar, Profile, Whois) tested once in Feature 4, not again in Feature 7
- **No soft patterns** — no `if (visible) then check` or `isVisible().catch()`. All assertions are strict.
- **`test.skip()` for conditional** — if a test depends on testnet state (e.g. records exist), use `test.skip()` with reason instead of silent `if/else`
- **`test.beforeEach` for shared setup** — auth tests share navigation + login in beforeEach

---

## CI Configuration

- **Unit Tests:** `npm run test:unit` (vitest)
- **Integration Tests:** `npm run test:integration` (Playwright)
- **CI runs on:** push/PR to `main` and `integration-tests` branches
- **Secrets required:** `TESTNET_PRIVATE_KEY` (GitHub repo secret)
- **Package manager:** npm (not pnpm — SMUI theme breaks)

---

## Test File Inventory

```
tests/
├── e2e/
│   ├── helpers.ts                        Shared login/navigation helpers
│   ├── domain-search.spec.ts             Feature 1 (3 tests)
│   ├── domain-registration.spec.ts       Feature 3 (9 tests)
│   ├── domain-management.spec.ts         Feature 4 (4 tests)
│   ├── domain-renewal.spec.ts            Feature 5 (3 tests)
│   ├── domain-transfer.spec.ts           Feature 6 (5 tests)
│   ├── dns-records.spec.ts               Feature 7 (7 tests)
│   ├── profile.spec.ts                   Feature 8 (5 tests)
│   ├── tld.spec.ts                       TLD page (3 tests)
│   ├── blockchain-ops.spec.ts            Blockchain Ops (4 tests, serial)
│   └── dev-wallet.spec.ts                DevWalletPanel (4 tests)
└── api/
    ├── domains.spec.ts                   Feature 9 (6 tests)
    └── fees.spec.ts                      Feature 9 (2 tests)
```

---

## ⚠️ DO NOT Test

- **Proposals** — Feature not in use.
- **Wallet Connection (browser extensions)** — Cannot be tested in Playwright.

---

## Known Issues

- `@partisiablockchain/abi-client` is CJS — default import pattern in `proposal.ts` for SSR compat
- **Playwright browsers** must be installed before running tests: `npx playwright install chromium` (or `--with-deps` for system deps). Without this, all e2e tests fail with `Executable doesn't exist`.
- SMUI theme requires npm (flat node_modules)

---

## Environment Requirements

- `TESTNET_PRIVATE_KEY`: `df4642ef...` (wallet owning `test.mpc` on testnet, address `00373c68...`)
- Node.js 20+
- npm
- Playwright browsers: `npx playwright install --with-deps chromium`
