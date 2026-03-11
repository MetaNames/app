## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2026-03-11 - Clear Search Input Icon
**Learning:** For a better UX, instead of users having to delete text backwards, there should be a clear button on search inputs to clear all text at once.
**Action:** When implementing a search input component, ensure there's a quick way for the user to clear out their query.
