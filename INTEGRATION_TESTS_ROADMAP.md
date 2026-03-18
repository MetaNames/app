# MetaNames App - Integration Tests Roadmap

> Document version: 1.0
> Created: 2026-03-18
> Branch: `integration-tests`

---

## Overview

Write Playwright integration tests for all MetaNames app features. Tests hit the actual SvelteKit app running in preview mode.

**Stack:** Playwright (E2E) + Vitest (unit/integration API tests)

---

## Features & User Stories

### Feature 1: Domain Search & Validation

| ID | Story | Priority |
|----|-------|----------|
| 1.1 | Search for domain name on homepage | P0 |
| 1.2 | Validate domain names before registration | P0 |
| 1.3 | See domain availability status | P1 |

### Feature 2: Wallet Connection

| ID | Story | Priority |
|----|-------|----------|
| 2.1 | Connect Partisia Wallet | P0 |
| 2.2 | Connect via MetaMask | P1 |
| 2.3 | Connect via Ledger | P2 |
| 2.4 | Disconnect wallet | P0 |
| 2.5 | See account balance | P1 |

### Feature 3: Domain Registration

| ID | Story | Priority |
|----|-------|----------|
| 3.1 | Register available domain | P0 |
| 3.2 | Choose BYOC token | P0 |
| 3.3 | Choose registration duration | P0 |
| 3.4 | Register subdomain | P1 |
| 3.5 | See registration confirmation | P0 |

### Feature 4: Domain Management

| ID | Story | Priority |
|----|-------|----------|
| 4.1 | View domain details | P0 |
| 4.2 | View domain records | P0 |
| 4.3 | See if I'm the owner | P0 |
| 4.4 | Navigate to owner | P1 |

### Feature 5: Domain Renewal

| ID | Story | Priority |
|----|-------|----------|
| 5.1 | Renew domain | P0 |
| 5.2 | See renewal fees | P0 |

### Feature 6: Domain Transfer

| ID | Story | Priority |
|----|-------|----------|
| 6.1 | Transfer domain | P0 |
| 6.2 | Validate recipient address | P1 |

### Feature 7: DNS Records

| ID | Story | Priority |
|----|-------|----------|
| 7.1 | Add DNS record | P0 |
| 7.2 | Edit DNS record | P0 |
| 7.3 | Delete DNS record | P0 |
| 7.4 | Validate record values | P1 |

### Feature 8: User Profile

| ID | Story | Priority |
|----|-------|----------|
| 8.1 | View profile | P1 |
| 8.2 | Search domains | P1 |
| 8.3 | Access domain from profile | P1 |

### Feature 9: API Endpoints

| Endpoint | Description | Priority |
|----------|-------------|----------|
| GET /api/domains/{name}/check | Check availability | P0 |
| GET /api/domains/{name} | Get domain details | P0 |
| GET /api/domains/recent | Get recent domains | P1 |
| GET /api/domains/stats | Get stats | P1 |
| GET /api/register/{name}/fees/{coin} | Get fees | P0 |
| POST /api/proposals/voters/add | Add voters | P2 |
| POST /api/proposals/voters/remove | Remove voters | P2 |

### Feature 10: Proposals

| ID | Story | Priority |
|----|-------|----------|
| 10.1 | View TLD migration proposal | P1 |
| 10.2 | Vote on proposal | P2 |

---

## Test Structure

```
tests/
├── e2e/
│   ├── domain-search.spec.ts      # Feature 1
│   ├── wallet-connect.spec.ts     # Feature 2
│   ├── domain-registration.spec.ts # Feature 3
│   ├── domain-management.spec.ts  # Feature 4
│   ├── domain-renewal.spec.ts     # Feature 5
│   ├── domain-transfer.spec.ts    # Feature 6
│   ├── dns-records.spec.ts        # Feature 7
│   ├── profile.spec.ts             # Feature 8
│   └── proposals.spec.ts          # Feature 10
└── api/
    ├── domains.spec.ts            # Feature 9 (API)
    └── fees.spec.ts               # Feature 9 (API)
```

---

## Testing Strategy

1. **E2E Tests (Playwright)**
   - Test full user flows in a real browser
   - Mock wallet connections (no real transactions)
   - Use `TESTNET_PRIVATE_KEY` for wallet-signing operations
   - Test happy paths and error states

2. **API Tests (Playwright/Supertest)**
   - Test API routes directly via HTTP
   - Verify request/response shapes
   - Test error handling

3. **Test Data**
   - Use testnet for all operations
   - Create test domains with known state
   - Clean up after tests

---

## Notes

- `TESTNET_PRIVATE_KEY` env var required for wallet operations
- Playwright runs against `http://localhost:4173` (preview server)
- Web server auto-started by Playwright config
- All wallet-dependent tests skip if no TESTNET_PRIVATE_KEY set
