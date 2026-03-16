# MetaNames App — Major Refactor Roadmap

> Roadmap for improving the MetaNames app (SvelteKit). Branch: `major-refactor`

---

## Current State

- **Tech Stack:** SvelteKit + SMUI (Material Design) + Vercel
- **Framework:** SvelteKit 2.x
- **UI Library:** SMUI 7.x (Material components)
- **Package Manager:** Yarn

---

## Design System

> **IMPORTANT:** The landing page has been modernized with a new design system. See `DESIGN_SYSTEM.md` for the unified design language.

### Key Design Tokens (from landing page)

| Element | Value |
|---------|-------|
| Font | **Plus Jakarta Sans** (geometric, modern) |
| Primary | `#6849fe` (purple) |
| Background | Dark gradient (purple → indigo) |
| Cards | Glassmorphism (`bg-white/5 backdrop-blur-sm`) |
| Borders | `border-white/10` |
| Radius | `rounded-2xl` cards, `rounded-full` buttons |
| Animations | 200-300ms ease-out, hover lift |

### Design System Goals for App

- [ ] Replace SMUI with custom components using design tokens
- [ ] Import Plus Jakarta Sans font
- [ ] Apply glassmorphism patterns to cards
- [ ] Add consistent hover/focus states
- [ ] **Add scroll reveal animations** ← Priority
- [ ] **Add micro-interactions** (hover lift, button press)
- [ ] Ensure mobile responsiveness matches landing page

---

## Priority Areas

### 0. Dependencies (HIGHEST PRIORITY)

> GitHub found 60 vulnerabilities (6 critical). Must address security first.

**New Upgrades:**
- [ ] **P0: Upgrade to Svelte 5** — Runes, snippets, improved performance
- [ ] **P0: Upgrade to SMUI 8** — Latest version with Svelte 5 support

**Issues:**
- SMUI 7.x is heavy and may have compatibility issues
- GitHub reports 60 vulnerabilities (6 critical, 19 high)
- Some dev dependencies may be outdated

**Goals:**
- [ ] **Upgrade to Svelte 5** ← New priority
- [ ] **Upgrade to SMUI 8** ← New priority
- [x] Run `yarn audit` to assess vulnerabilities
- [x] Run `yarn outdated` to check outdated packages
- [x] **Build now succeeds** ✅ (npm build passes in 23.97s)
- [ ] Update critical security patches first (remaining 13 vulnerabilities are deep transitive deps)
- [ ] Consider migrating from SMUI to custom components (removes heavy dependency)
- [ ] Update outdated packages
- [ ] Consider switching from Yarn to npm/pnpm if needed

---

### 1. Design System

> **IMPORTANT:** The landing page has been modernized with a new design system. See `DESIGN_SYSTEM.md` for the unified design language.

### Key Design Tokens (from landing page)

| Element | Value |
|---------|-------|
| Font | **Plus Jakarta Sans** (geometric, modern) |
| Primary | `#6849fe` (purple) |
| Background | Dark gradient (purple → indigo) |
| Cards | Glassmorphism (`bg-white/5 backdrop-blur-sm`) |
| Borders | `border-white/10` |
| Radius | `rounded-2xl` cards, `rounded-full` buttons |
| Animations | 200-300ms ease-out, hover lift |

**Design System Goals:**
- [ ] Replace SMUI with custom components using design tokens
- [ ] Import Plus Jakarta Sans font
- [ ] Apply glassmorphism patterns to cards
- [ ] Add consistent hover/focus states
- [ ] **Add scroll reveal animations** ← Priority
- [ ] **Add micro-interactions** (hover lift, button press)
- [ ] Ensure mobile responsiveness matches landing page

---

### 2. Project Structure

**Issues:**
- Routes mixed with components in `src/routes/`
- Some components in `src/components/`, some in `src/routes/`
- No clear separation of concerns

**Goals:**
- [ ] Move all components to `src/lib/components/`
- [ ] Move stores to `src/lib/stores/`
- [ ] Move API utilities to `src/lib/api/`
- [ ] Create `src/routes/api/` for API routes
- [ ] Add `src/types/` for TypeScript types
- [ ] Add `src/utils/` for utility functions

---

### 3. Performance

**Goals:**
- [ ] Implement code splitting
- [ ] Add lazy loading for heavy components
- [ ] Optimize images and assets
- [ ] Add service worker for offline support
- [ ] Implement proper caching headers
- [ ] Analyze bundle size and optimize

---

### 4. Features

**Potential Improvements:**
- [ ] User dashboard with domain management
- [ ] Domain search with filters
- [ ] Bulk domain operations
- [ ] Domain transfer flow
- [ ] Profile page enhancements
- [ ] Mobile-responsive improvements
- [ ] Dark mode support (beyond SMUI theme)

---

### 5. Layout & UI/UX

> **Aligned with Landing Page Design System** — See `DESIGN_SYSTEM.md`

**Issues:**
- Heavy Material Design look from SMUI doesn't match landing page
- Mobile responsiveness may need work
- No consistent design system

**Goals:**
- [ ] Import Plus Jakarta Sans font
- [ ] Create `src/lib/design-tokens.css` with CSS variables
- [ ] Create custom UI components (Button, Card, Input) using design tokens
- [ ] Apply glassmorphism patterns to cards and containers
- [ ] Add consistent hover/focus states with lift animations
- [ ] Add scroll reveal animations (fade-in on scroll)
- [ ] Add micro-interactions (button press, hover effects)
- [ ] Implement dark theme consistently
- [ ] Audit mobile responsiveness
- [ ] Improve accessibility (a11y)
- [ ] Add loading skeletons
- [ ] Improve error states
- [ ] Add empty states

---

### 6. Animations

> Following landing page patterns: 200-300ms ease-out, scroll reveal, hover lift

**Goals:**
- [ ] Add scroll reveal animations (fade-in on viewport enter)
- [ ] Add page transition animations
- [ ] Add micro-interactions (button hover/press effects)
- [ ] Add loading state animations
- [ ] Add staggered list animations for domain lists
- [ ] Ensure animations are performant (use CSS transforms)
- [ ] Add `prefers-reduced-motion` support

---

### 7. Code Quality

**Goals:**
- [ ] Add/fix TypeScript types
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up CI/CD
- [ ] Add linting and formatting
- [ ] Create component documentation

---

## Iteration Log

| # | Date | Area | Task | Result | Notes |
|---|------|------|------|--------|-------|
| 1 | 2026-03-16 | Dependencies | Audit vulnerabilities | Partial | 26→13 vulnerabilities reduced via npm audit fix. Remaining: bn.js, elliptic (deep chain from @metanames/sdk). |
| 2 | 2026-03-16 | Dependencies | Fix vulnerabilities | Blocked | npm audit fix broke build. Corepack/yarn issues in Docker container prevent clean fix. SMUI theme compilation blocked. |

---

## Decisions Log

| Date | Decision | Rationale | Outcome |
|------|----------|-----------|---------|
| 2026-03-16 | Use npm instead of yarn | Yarn corepack fails in container environment | Partial - npm works but prepare script (yarn) still runs |
| 2026-03-16 | Cannot use npm audit fix --force | Would break @metanames/sdk (requires older elliptic) | Blocked - SDK depends on vulnerable transitive deps |
| 2026-03-16 | Use npm run build instead of yarn | Bypasses yarn corepack issues | ✅ Works - verified build passes |
| 2026-03-16 | Fix @partisiablockchain/abi-client imports | SDK v5 changed export names (FnRpcBuilder→RpcBuilder, AbiOutputBytes→AbiBitOutput) | ✅ Build passes in 23.30s |

---

## Decisions Log

| Date | Decision | Rationale | Outcome |
|------|----------|-----------|---------|
| | | | |

---

*Last updated: 2026-03-15*
