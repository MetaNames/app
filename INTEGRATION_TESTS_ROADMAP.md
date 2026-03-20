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

### Feature 2: Wallet Connection — SKIPPED

> **Reason:** Cannot test browser extensions (Partisia Wallet, MetaMask, Ledger) in Playwright E2E tests. Wallet connection requires user interaction with external browser extensions which is not possible in an automated test environment.
> These would need manual testing or a specialized testing setup (e.g., Mocked wallet provider injected via browser context).

| ID | Story | Priority |
|----|-------|----------|
| 2.1 | Connect Partisia Wallet | N/A |
| 2.2 | Connect via MetaMask | N/A |
| 2.3 | Connect via Ledger | N/A |
| 2.4 | Disconnect wallet | N/A |
| 2.5 | See account balance | N/A |

### Feature 2: Domain Registration

| ID | Story | Priority |
|----|-------|----------|
| 3.1 | Register available domain | P0 |
| 3.2 | Choose BYOC token | P0 |
| 3.3 | Choose registration duration | P0 |
| 3.4 | Register subdomain | P1 |
| 3.5 | See registration confirmation | P0 |

### Feature 3: Domain Management

| ID | Story | Priority |
|----|-------|----------|
| 3.1 | View domain details | P0 |
| 3.2 | View domain records | P0 |
| 3.3 | See if I'm the owner | P0 |
| 3.4 | Navigate to owner | P1 |

### Feature 4: Domain Renewal

| ID | Story | Priority |
|----|-------|----------|
| 4.1 | Renew domain | P0 |
| 4.2 | See renewal fees | P0 |

### Feature 5: Domain Transfer

| ID | Story | Priority |
|----|-------|----------|
| 5.1 | Transfer domain | P0 |
| 5.2 | Validate recipient address | P1 |

### Feature 6: DNS Records

| ID | Story | Priority |
|----|-------|----------|
| 6.1 | Add DNS record | P0 |
| 6.2 | Edit DNS record | P0 |
| 6.3 | Delete DNS record | P0 |
| 6.4 | Validate record values | P1 |

### Feature 7: User Profile

| ID | Story | Priority |
|----|-------|----------|
| 7.1 | View profile | P1 |
| 7.2 | Search domains | P1 |
| 7.3 | Access domain from profile | P1 |

### Feature 8: API Endpoints

| Endpoint | Description | Priority |
|----------|-------------|----------|
| GET /api/domains/{name}/check | Check availability | P0 |
| GET /api/domains/{name} | Get domain details | P0 |
| GET /api/domains/recent | Get recent domains | P1 |
| GET /api/domains/stats | Get stats | P1 |
| GET /api/register/{name}/fees/{coin} | Get fees | P0 |
| POST /api/proposals/voters/add | Add voters | P2 |
| POST /api/proposals/voters/remove | Remove voters | P2 |

### Feature 9: Proposals

| ID | Story | Priority |
|----|-------|----------|
| 9.1 | View TLD migration proposal | P1 |
| 9.2 | Vote on proposal | P2 |

---

## Test Structure

```
tests/
├── e2e/
│   ├── domain-search.spec.ts        # Feature 1
│   ├── domain-registration.spec.ts  # Feature 2
│   ├── domain-management.spec.ts     # Feature 3
│   ├── domain-renewal.spec.ts        # Feature 4
│   ├── domain-transfer.spec.ts       # Feature 5
│   ├── dns-records.spec.ts          # Feature 6
│   ├── profile.spec.ts              # Feature 7
│   └── proposals.spec.ts            # Feature 9
└── api/
    ├── domains.spec.ts             # Feature 8 (API)
    └── fees.spec.ts                # Feature 8 (API)
```

---

## Testing Strategy

1. **E2E Tests (Playwright)**
   - Test full user flows in a real browser
   - Mock wallet connections where possible (no real wallet extensions)
   - Use `TESTNET_PRIVATE_KEY` for wallet-signing operations when supported
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

- Wallet extension tests (Partisia, MetaMask, Ledger) are excluded — cannot automate browser extension interactions in Playwright
- `TESTNET_PRIVATE_KEY` env var required for wallet signing tests
- Playwright runs against `http://localhost:4173` (preview server)
- Web server auto-started by Playwright config

---

## Dev Wallet Panel (Testnet Only)

**Status:** ✅ Implemented (2026-03-20)

A testnet-only dev panel allows injecting a wallet address OR logging in with a private key for full transaction signing.

**Purpose:** Enable testing of owner-only features (Settings tab, DNS record editing, domain transfers) with real transaction signing in local/dev environments.

**Two modes:**

1. **Address Only (UI Testing)**
   - Paste a Partisia address (66 chars)
   - Sets `$walletAddress` store directly
   - No transaction signing possible
   - Good for: testing UI flows that don't require signing

2. **Private Key (Full Integration Testing)**
   - Click "▶ Full Access (Private Key)" to expand
   - Paste private key (64 chars)
   - Uses `sdk.setSigningStrategy('privateKey', privateKey)` to enable real signing
   - Derives address from private key via `privateKeyToAccountAddress()`
   - Full transaction signing works
   - Good for: testing DNS record updates, transfers, renewals

**How it works:**
1. Shows as a "🐷 Dev Wallet" button in the bottom-right corner (testnet only)
2. Click to open panel
3. Choose Address Only or Private Key mode
4. Wallet persists until cleared with × button

**Security:** Only available when `config.environment === 'test'` (same as TESTNET badge)

**Files:**
- `src/components/DevWalletPanel.svelte` — the dev wallet panel component
- `src/routes/+layout.svelte` — imports and renders DevWalletPanel

**SDK Integration:**
- Uses `metaNamesSdk.setSigningStrategy('privateKey', privateKey)` for real signing
- Uses `privateKeyToAccountAddress()` from `partisia-blockchain-applications-crypto` to derive address
