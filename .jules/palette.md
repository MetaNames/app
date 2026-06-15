## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2024-10-24 - Conditionally render clear button and improve aria-label
**Learning:** Textfields with a trailing clear icon can cause issues for keyboard navigation if the clear button is focusable while the input is empty. Additionally, "cancel" is too generic for an action that simply clears a search field.
**Action:** Always conditionally render clear icons (`{#if search !== ''}`) and bind the `withTrailingIcon` property to the same condition. Also, ensure the `aria-label` is descriptive, like "clear search".
