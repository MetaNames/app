# MetaNames App — Major Refactor Roadmap

> Roadmap for improving the MetaNames app (SvelteKit). Branch: `major-refactor`

---

## Current State

- **Tech Stack:** SvelteKit + SMUI (Material Design) + Vercel
- **Framework:** SvelteKit 2.x
- **UI Library:** SMUI 7.x (Material components)
- **Package Manager:** Yarn

---

## Priority Areas

### 1. Dependencies

**Issues:**
- SMUI 7.x is heavy and may have compatibility issues
- Some dev dependencies may be outdated
- Need to audit for security vulnerabilities

**Goals:**
- [ ] Audit all dependencies for versions and security
- [ ] Consider migrating from SMUI to a lighter UI library (or custom components)
- [ ] Update outdated packages
- [ ] Consider switching from Yarn to npm/pnpm if needed

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

**Issues:**
- Heavy Material Design look may not fit brand
- Mobile responsiveness may need work
- No consistent design system

**Goals:**
- [ ] Audit mobile responsiveness
- [ ] Improve accessibility (a11y)
- [ ] Create design tokens/constants
- [ ] Add loading skeletons
- [ ] Improve error states
- [ ] Add empty states
- [ ] Improve navigation UX

---

### 6. Code Quality

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
| 1 | TBD | - | Initial roadmap | Pending | - |

---

## Decisions Log

| Date | Decision | Rationale | Outcome |
|------|----------|-----------|---------|
| | | | |

---

*Last updated: 2026-03-15*
