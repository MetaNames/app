# MetaNames App - Features & User Stories

> Document version: 1.1
> Created: 2026-03-17

---

## Feature 1: Domain Search & Validation (3 stories)

| ID  | Story                                     | Acceptance Criteria                                                      |
| --- | ----------------------------------------- | ------------------------------------------------------------------------ |
| 1.1 | Search for domain name on homepage        | Search input accepts domain name, results appear, available/taken status |
| 1.2 | Validate domain names before registration | Invalid names show error, valid names proceed, supports subdomains       |
| 1.3 | See domain availability status            | Shows Available/Taken, parent domain status for subdomains               |

---

## Feature 2: Wallet Connection (5 stories)

| ID  | Story                   | Acceptance Criteria                          |
| --- | ----------------------- | -------------------------------------------- |
| 2.1 | Connect Partisia Wallet | Opens wallet, shows address, persists        |
| 2.2 | Connect via MetaMask    | Opens MetaMask, shows address, supports Snap |
| 2.3 | Connect via Ledger      | Opens Ledger, shows address                  |
| 2.4 | Disconnect wallet       | Clears session, updates UI                   |
| 2.5 | See account balance     | Shows MPC and gas balance                    |

---

## Feature 3: Domain Registration (5 stories)

| ID  | Story                         | Acceptance Criteria                                           |
| --- | ----------------------------- | ------------------------------------------------------------- |
| 3.1 | Register available domain     | Validated domain, connected wallet, BYOC payment, transaction |
| 3.2 | Choose BYOC token             | Support USDT/USDC/etc, fee calculation shown                  |
| 3.3 | Choose registration duration  | 1-5 years, price updates                                      |
| 3.4 | Register subdomain            | Parent domain required, owned by user                         |
| 3.5 | See registration confirmation | Success message, redirect, analytics                          |

---

## Feature 4: Domain Management (4 stories)

| ID  | Story                | Acceptance Criteria                             |
| --- | -------------------- | ----------------------------------------------- |
| 4.1 | View domain details  | Name, owner, creation date, expiration, records |
| 4.2 | View domain records  | Lists DNS records with type and value           |
| 4.3 | See if I'm the owner | Ownership via connected wallet                  |
| 4.4 | Navigate to owner    | Click owner address → profile/owner view        |

---

## Feature 5: Domain Renewal (2 stories)

| ID  | Story            | Acceptance Criteria                                     |
| --- | ---------------- | ------------------------------------------------------- |
| 5.1 | Renew domain     | Current expiration, select years, payment, confirmation |
| 5.2 | See renewal fees | Fee calculation, MPC and BYOC support                   |

---

## Feature 6: Domain Transfer (2 stories)

| ID  | Story                      | Acceptance Criteria                                 |
| --- | -------------------------- | --------------------------------------------------- |
| 6.1 | Transfer domain            | Input recipient, validate, confirm, success message |
| 6.2 | Validate recipient address | Partisia address format validation                  |

---

## Feature 7: DNS Records (4 stories)

| ID  | Story                  | Acceptance Criteria                       |
| --- | ---------------------- | ----------------------------------------- |
| 7.1 | Add DNS record         | A/AAAA/CNAME/TXT, validate, transaction   |
| 7.2 | Edit DNS record        | Pre-fill, validate, transaction           |
| 7.3 | Delete DNS record      | Confirmation dialog, transaction          |
| 7.4 | Validate record values | A=IPv4, AAAA=IPv6, CNAME=domain, TXT=text |

---

## Feature 8: User Profile (3 stories)

| ID  | Story                      | Acceptance Criteria                         |
| --- | -------------------------- | ------------------------------------------- |
| 8.1 | View profile               | Wallet address, owned domains, domain count |
| 8.2 | Search domains             | Filter by name, real-time                   |
| 8.3 | Access domain from profile | Click domain → domain page                  |

---

## Feature 9: API Endpoints (7 endpoints)

| Endpoint                             | Description           |
| ------------------------------------ | --------------------- |
| GET /api/domains/{name}/check        | Check availability    |
| GET /api/domains/{name}              | Get domain details    |
| GET /api/domains/recent              | Get recent domains    |
| GET /api/domains/stats               | Get stats             |
| GET /api/register/{name}/fees/{coin} | Get fees              |
| POST /api/proposals/voters/add       | Add voters (admin)    |
| POST /api/proposals/voters/remove    | Remove voters (admin) |

---

## Feature 10: UI Components (15+ components)

Button, Input, Card, Dialog, Select, Chip, CircularProgress, Radio, DomainSearch, DomainPayment, DomainsTable, Navbar, Footer, etc.

---

## Feature 12: Utility Functions (4+ functions)

| Function                 | Description                      |
| ------------------------ | -------------------------------- |
| validAddress             | Validate Partisia address format |
| isValidURL               | Validate URL format              |
| removeHTTPIfPresent      | Strip protocol prefix            |
| formatDate               | Format date to readable string   |
| formatDateToRelativeDate | Format to relative time          |

---

## Test Stack

- **Vitest** for unit/integration tests
- **Playwright** for e2e tests
- Mock SDK responses where needed
- Integration tests hit actual API routes
