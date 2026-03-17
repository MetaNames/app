# MetaNames App - Features & User Stories

> Document version: 1.0
> Created: 2026-03-17

---

## Feature 1: Domain Search & Validation

### Description
Users can search for available domain names and validate them before registration.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 1.1 | As a user, I want to search for a domain name on the homepage | - Search input accepts domain name<br>- Results appear after typing<br>- Available domains show registration option<br>- Taken domains show domain details |
| 1.2 | As a user, I want to validate domain names before registration | - Invalid names show error message<br>- Valid names proceed to registration<br>- Supports subdomains (e.g., user.domain.meta) |
| 1.3 | As a user, I want to see domain availability status | - Shows "Available" for unregistered names<br>- Shows "Taken" for registered names<br>- Shows parent domain status for subdomains |

---

## Feature 2: Wallet Connection

### Description
Users can connect their Partisia Wallet, MetaMask, or Ledger to interact with the app.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 2.1 | As a user, I want to connect my Partisia Wallet | - Click connect button opens Partisia Wallet<br>- Successful connection shows address<br>- Connection state persists across pages |
| 2.2 | As a user, I want to connect via MetaMask | - Click connect button opens MetaMask<br>- Successful connection shows address<br>- Supports Partisia Snap |
| 2.3 | As a user, I want to connect via Ledger | - Click connect button opens Ledger<br>- Successful connection shows address |
| 2.4 | As a user, I want to disconnect my wallet | - Disconnect button clears session<br>- UI updates to show disconnected state |
| 2.5 | As a user, I want to see my account balance | - Balance displays for connected wallet<br>- Shows MPC and gas balance |

---

## Feature 3: Domain Registration

### Description
Users can register new domain names using their connected wallet.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 3.1 | As a user, I want to register an available domain | - Domain must be validated<br>- User must have connected wallet<br>- BYOC payment displayed<br>- Transaction submitted on confirm |
| 3.2 | As a user, I want to choose BYOC token | - Support BYOC tokens (USDT, USDC, etc.)<br>- Fee calculation shown before confirm |
| 3.3 | As a user, I want to choose registration duration | - Options: 1, 2, 3, 4, 5 years<br>- Price updates based on duration |
| 3.4 | As a user, I want to register a subdomain | - Must have parent domain<br>- Parent must be owned by user<br>- Same payment flow as main domain |
| 3.5 | As a user, I want to see registration confirmation | - Success message on completion<br>- Redirect to domain page<br>- Analytics tracking |

---

## Feature 4: Domain Management (View Details)

### Description
Users can view their registered domain details.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 4.1 | As a user, I want to view domain details | - Shows domain name, owner, creation date<br>- Shows expiration date<br>- Shows all records |
| 4.2 | As a user, I want to view domain records | - Lists all DNS records<br>- Shows record type and value |
| 4.3 | As a user, I want to see if I'm the owner | - Ownership verified via connected wallet |
| 4.4 | As a user, I want to navigate to domain owner | - Click on owner address navigates to profile/owner view |

---

## Feature 5: Domain Renewal

### Description
Users can renew their domain registrations.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 5.1 | As a domain owner, I want to renew my domain | - Shows current expiration<br>- Allows selecting renewal years<br>- Payment flow same as registration<br>- Success confirmation |
| 5.2 | As a domain owner, I want to see renewal fees | - Fee calculation before confirmation<br>- Supports MPC and BYOC |

---

## Feature 6: Domain Transfer

### Description
Users can transfer their domains to another address.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 6.1 | As a domain owner, I want to transfer my domain | - Input recipient address<br>- Validate address format<br>- Confirm transaction<br>- Success message |
| 6.2 | As a domain owner, I want to validate recipient address | - Check Partisia address validity<br>- Show error for invalid addresses |

---

## Feature 7: DNS Records Management

### Description
Users can add, edit, and delete DNS records for their domains.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 7.1 | As a domain owner, I want to add a DNS record | - Supported types: A, AAAA, CNAME, TXT, etc.<br>- Validate record value<br>- Transaction confirmation |
| 7.2 | As a domain owner, I want to edit a DNS record | - Pre-fill current value<br>- Validate new value<br>- Transaction confirmation |
| 7.3 | As a domain owner, I want to delete a DNS record | - Confirmation dialog<br>- Transaction submission |
| 7.4 | As a domain owner, I want to validate record values | - A record: valid IPv4<br>- AAAA record: valid IPv6<br>- CNAME: valid domain<br>- TXT: valid text |

---

## Feature 8: User Profile

### Description
Users can view their profile and manage their domains.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 8.1 | As a user, I want to view my profile | - Shows connected wallet address<br>- Lists all owned domains<br>- Shows domain count |
| 8.2 | As a user, I want to search my domains | - Filter domains by name<br>- Real-time filtering |
| 8.3 | As a user, I want to access my domain from profile | - Click domain navigates to domain page |

---

## Feature 9: API Endpoints

### Description
Backend API endpoints for domain operations.

### User Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| 10.1 | Check domain availability | GET /api/domains/{name}/check<br>Returns: domainPresent, parentPresent |
| 10.2 | Get domain details | GET /api/domains/{name}<br>Returns: domain data |
| 10.3 | Get recent domains | GET /api/domains/recent<br>Returns: list of recent domains |
| 10.4 | Get domain stats | GET /api/domains/stats<br>Returns: domainCount, ownerCount |
| 10.5 | Get registration fees | GET /api/register/{name}/fees/{coin}<br>Returns: fee calculation |
| 10.6 | Add proposal voters (admin) | POST /api/proposals/voters/add<br>Adds eligible voters |
| 10.7 | Remove proposal voters (admin) | POST /api/proposals/voters/remove<br>Removes voters |

---

## Feature 10: UI Components

### Description
Reusable UI components used throughout the app.

### Components to Test

| Component | Description |
|-----------|-------------|
| Button | Primary, secondary, loading states |
| Input | Text input with validation |
| Card | Container with styling |
| Dialog | Modal dialog |
| Select | Dropdown selection |
| Chip | Tag-like element |
| CircularProgress | Loading spinner |
| Radio | Radio button group |
| DomainSearch | Search form with validation |
| DomainPayment | Payment flow component |
| DomainsTable | Table with sorting/pagination |
| Navbar | Navigation header |
| Footer | Footer with links |

---

## Feature 11: Utility Functions

### Description
Core utility functions used across the app.

### Functions to Test

| Function | Description |
|----------|-------------|
| validAddress | Validate Partisia address format |
| getRecordClassFrom | Map record type string to class |
| getValidator | Get validator for record type |
| alertTransactionAndFetchResult | Handle transaction result |

---

## Test Categories Summary

| Category | Count |
|----------|-------|
| User Stories | 40+ |
| Features | 11 |
| UI Components | 15+ |
| API Endpoints | 7 |
| Utility Functions | 4+ |

---

## Notes

- Tests will use **Vitest** for unit/integration tests
- **Playwright** for e2e tests
- Mock SDK responses where needed for unit tests
- Integration tests hit actual API routes
- E2E tests run against local dev server
