# MetaNames App — STATUS.md

> Branch: `major-refactor`
> Tech Stack: SvelteKit + SMUI + Vercel

---

## Current Focus

- **Phase:** Initial Analysis & Roadmap
- **Priority:** Dependencies → Structure → Performance → Features → Layout

---

## Progress

### Dependencies
- [ ] Audit all dependencies for versions and security
- [ ] Consider migrating from SMUI to a lighter UI library
- [ ] Update outdated packages

### Project Structure
- [ ] Move all components to `src/lib/components/`
- [ ] Move stores to `src/lib/stores/`
- [ ] Move API utilities to `src/lib/api/`
- [ ] Create proper type definitions

### Performance
- [ ] Implement code splitting
- [ ] Add lazy loading
- [ ] Optimize bundle size

### Features
- [ ] TBD based on user needs

### Layout & UI/UX
- [ ] Audit mobile responsiveness
- [ ] Improve accessibility

| # | Date (UTC) | Task | Status | Notes |
|---|------------|------|--------|-------|
| 1 | 2026-03-16 | Dependencies audit | Partial | npm audit shows 26→13 vulnerabilities reduced. Remaining: bn.js, elliptic (deep chain from @metanames/sdk). Corepack/yarn issues in container prevent full fix. |
| 2 | 2026-03-16 | Dependencies fix attempt | Blocked | npm audit fix broke build (removed too many packages). Restored yarn.lock. SMUI theme compilation blocked by corepack issues in container. |
| 3 | 2026-03-16 06:06 | Design System - Design Tokens | ✅ Done | Created design-tokens.css with CSS variables, added scroll reveal action. Build verified with npm. |

---

## Blockers

- **Environment:** Docker container has yarn corepack issues (`Failed to create cache directory`)
- **SMUI Theme:** Cannot compile themes (npx smui-theme fails, local install also fails)
- **Build:** Cannot verify changes without working SMUI theme compilation

---

## Quick Commands

```bash
# Install deps
yarn install

# Run dev
yarn dev

# Build
yarn build

# Lint
yarn lint
```

---

*Updated: 2026-03-15*
