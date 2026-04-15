## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-24 - Dynamic Search Input Icons
**Learning:** Having a permanent "cancel" or "clear" icon on a search input when it's empty creates a false affordance, as there is nothing to clear. Additionally, using `aria-label="cancel"` for clearing a search can be ambiguous to screen reader users.
**Action:** Conditionally render the clear icon only when text is present (e.g., `{#if search.length > 0}`), and use a disabled "search" icon otherwise. Always use explicit action-oriented labels like `aria-label="Clear search"`.
