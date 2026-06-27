## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-11-05 - Conditionally rendering and labeling clear buttons in inputs
**Learning:** Always conditionally render trailing clear icons in text fields (e.g., `{#if search !== ''}`) so they don't receive keyboard focus when the input is already empty. Also dynamically bind the `withTrailingIcon` property so layout stays consistent, and replace generic 'cancel' aria-labels with specific ones like 'clear search' to give screen reader users context.
**Action:** Apply conditional rendering to the trailing icon fragment, bind `withTrailingIcon` dynamically, and use a descriptive `aria-label`.
