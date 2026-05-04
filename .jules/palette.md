## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2026-05-04 - Native MDC Menu Anchoring

**Learning:** SMUI (Svelte Material UI) and Material Design Components support native menu anchoring. Using custom CSS position overrides (like `left: unset !important`) breaks accessibility patterns and proper floating behavior. The correct approach is to wrap the trigger and the `<Menu>` in a container with the `mdc-menu-surface--anchor` class, bind the anchor element to the menu, and use MDC's built-in `anchorCorner` properties (e.g. `BOTTOM_END`) to position it relative to the trigger.
**Action:** Use native `mdc-menu-surface--anchor` and `anchorCorner` properties for dropdown positioning instead of manual CSS hacks. Add `aria-haspopup="listbox"` and `aria-expanded` to trigger buttons to ensure full keyboard and screen reader accessibility.
