# MetaNames App - Integration Tests Status

> Last updated: 2026-03-18 17:35 UTC
> Branch: `staging`

---

## Progress

| Feature | Status | Stories | Notes |
|---------|--------|---------|-------|
| Feature 1: Domain Search | ✅ Done | 3/3 | PR #188 - 3 tests written, CI needed to run |
| Feature 2: Wallet Connection | ⏳ Pending | 5 | - |
| Feature 3: Domain Registration | ⏳ Pending | 5 | - |
| Feature 4: Domain Management | ⏳ Pending | 4 | - |
| Feature 5: Domain Renewal | ⏳ Pending | 2 | - |
| Feature 6: Domain Transfer | ⏳ Pending | 2 | - |
| Feature 7: DNS Records | ⏳ Pending | 4 | - |
| Feature 8: User Profile | ⏳ Pending | 3 | - |
| Feature 9: API Endpoints | ⏳ Pending | 7 | - |
| Feature 10: Proposals | ⏳ Pending | 2 | - |

**Total:** 37 stories | **Completed:** 0 | **Progress:** 0%

---

## Current Iteration

**Status:** In Progress
**Next feature:** Feature 2 - Wallet Connection
**Next story:** 2.1 - Connect Partisia Wallet

---

## Iteration Log

| # | Date | Feature | Stories | Notes |
|---|------|---------|---------|-------|
| 1 | 2026-03-18 | Setup | - | Created ROADMAP.md, STATUS.md |
| 2 | 2026-03-18 | Feature 1: Domain Search | 3/3 | PR #188 |

---

## Test File Inventory

```
tests/
├── e2e/                    ✅ Created structure
│   ├── domain-search.spec.ts
│   ├── wallet-connect.spec.ts
│   ├── domain-registration.spec.ts
│   ├── domain-management.spec.ts
│   ├── domain-renewal.spec.ts
│   ├── domain-transfer.spec.ts
│   ├── dns-records.spec.ts
│   ├── profile.spec.ts
│   └── proposals.spec.ts
└── api/
    ├── domains.spec.ts
    └── fees.spec.ts
```

---

## Known Issues

- Build currently fails due to `@partisiablockchain/abi-client` import error (pre-existing, unrelated to tests) - **Use `npm run dev` instead of `npm run build` for local testing**
- Playwright tests cannot run locally in container (missing browser deps: libnss3, libnspr4, etc.) - **CI handles this; tests committed to PR #188**

---

## Environment Requirements

- `TESTNET_PRIVATE_KEY`: Required for wallet signing tests
- Node.js 20+
- pnpm
- Playwright browsers: `npx playwright install`
