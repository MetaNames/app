# MetaNames App - Integration Tests Status

> Last updated: 2026-03-18 18:06 UTC
> Branch: `integration-tests`

---

## Progress

| Feature | Status | Stories | Notes |
|---------|--------|---------|-------|
| Feature 1: Domain Search | ✅ Done | 3 | Merged into `integration-tests` |
| Feature 2: Wallet Connection | ⏳ Pending | 5 | - |
| Feature 3: Domain Registration | ⏳ Pending | 5 | - |
| Feature 4: Domain Management | ⏳ Pending | 4 | - |
| Feature 5: Domain Renewal | ⏳ Pending | 2 | - |
| Feature 6: Domain Transfer | ⏳ Pending | 2 | - |
| Feature 7: DNS Records | ⏳ Pending | 4 | - |
| Feature 8: User Profile | ⏳ Pending | 3 | - |
| Feature 9: API Endpoints | ⏳ Pending | 7 | - |
| Feature 10: Proposals | ⏳ Pending | 2 | - |

**Total:** 37 stories | **Completed:** 3 | **Progress:** 8%

---

## Current Iteration

**Status:** Ready for Feature 2 - Wallet Connection
**Next story:** 2.1 - Connect Partisia Wallet

---

## Iteration Log

| # | Date | Feature | Stories | Notes |
|---|------|---------|---------|-------|
| 1 | 2026-03-18 | Feature 1: Domain Search | 3 | Merged into `integration-tests` |

---

## Test File Inventory

```
tests/
├── e2e/
│   ├── domain-search.spec.ts        ✅ Feature 1 (3 tests)
│   ├── wallet-connect.spec.ts       ⏳ Feature 2 (pending)
│   ├── domain-registration.spec.ts ⏳ Feature 3 (pending)
│   ├── domain-management.spec.ts    ⏳ Feature 4 (pending)
│   ├── domain-renewal.spec.ts       ⏳ Feature 5 (pending)
│   ├── domain-transfer.spec.ts      ⏳ Feature 6 (pending)
│   ├── dns-records.spec.ts         ⏳ Feature 7 (pending)
│   ├── profile.spec.ts             ⏳ Feature 8 (pending)
│   └── proposals.spec.ts           ⏳ Feature 10 (pending)
└── api/
    ├── domains.spec.ts             ⏳ Feature 9 (pending)
    └── fees.spec.ts                ⏳ Feature 9 (pending)
```

---

## Known Issues

- Build fails due to `@partisiablockchain/abi-client` import error — pre-existing, unrelated to tests. Use `npm run dev` for local testing.

---

## Environment Requirements

- `TESTNET_PRIVATE_KEY`: Required for wallet signing tests
- Node.js 20+
- pnpm
- Playwright browsers: `npx playwright install`
