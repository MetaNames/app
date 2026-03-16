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
| 4 | 2026-03-16 08:08 | Custom Button Component | ✅ Done | Created src/lib/components/Button.svelte with design tokens. Build verified with npm. |
| 5 | 2026-03-16 10:04 | Build Fix | ✅ Done | Build now succeeds (✓ built in 23.97s). Warnings are optional deps only. |
| 6 | 2026-03-16 11:12 | Build Fix - SDK Import | ✅ Done | Fixed @partisiablockchain/abi-client v5 imports (AbiOutputBytes→AbiBitOutput, FnRpcBuilder→RpcBuilder). Build passes in 23.30s. |
| 7 | 2026-03-16 11:12 | Dependencies - npm | ✅ Done | Switched from yarn to npm (yarn corepack fails in container). Added package-lock.json. |
| 8 | 2026-03-16 15:02 | Components - Card/Input/Radio | ✅ Done | Created CircularProgress, Radio, IconButton. Updated transfer/profile/tld-migration pages. Build passes. |
| 9 | 2026-03-16 19:02 | DomainSearch SMUI Replacement | ✅ Done | Replaced SMUI Card, CircularProgress, Textfield, IconButton with custom components. Updated Input for variant/autofocus support. Build passes in 24.13s. |
| 10 | 2026-03-16 20:07 | SMUI Button Replacement | ✅ Done | Replaced SMUI Button in GoBackButton, LoadingButton, Chip. Replaced SMUI Card/Dialog/Input/Select in DomainPayment, Record. Build passes in 23.92s. |
| 11 | 2026-03-16 22:08 | Domain.svelte SMUI Replacement | ✅ Done | Created TabBar.svelte, replaced SMUI Card/Paper/Tab/TabBar/Button with custom components. Build passes in 23.91s. |

---

## Blockers

- **SMUI Theme:** Cannot compile themes (npx smui-theme fails)

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

*Updated: 2026-03-16*
