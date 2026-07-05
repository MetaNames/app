## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-11-20 - Accessible Menu Triggers

**Learning:** Interactive trigger elements that open SMUI menus lack native screen reader context for their expanded state.
**Action:** Ensure elements that trigger SMUI menus include `aria-haspopup="menu"` and bind `aria-expanded` to the state variable that tracks the menu's open status.
