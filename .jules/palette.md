## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2024-05-30 - Contextual Trailing Icons and Descriptive ARIA Labels
**Learning:** Clear buttons in search inputs should only be visually present and focusable when there is text to clear. Furthermore, generic labels like "cancel" are ambiguous for screen readers in the context of search inputs.
**Action:** Conditionally render clear icons (e.g., `{#if search !== ''}`) to ensure they are omitted from the tab order when empty. Bind attributes like `withTrailingIcon` to the same condition to maintain layout, and always use descriptive action-oriented labels like "clear search".
