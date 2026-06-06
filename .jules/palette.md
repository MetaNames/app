## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-24 - Conditionally Rendering Trailing Icons in SMUI Textfields

**Learning:** When conditionally rendering a trailing icon (like a clear button) inside an SMUI `Textfield` component, the icon element itself must be conditionally rendered (e.g., `{#if search !== ''}`) so it is not focusable when empty. Furthermore, the `withTrailingIcon` property on the `Textfield` must be dynamically bound to the same condition (e.g., `withTrailingIcon={search !== ''}`) to ensure the layout updates correctly, and a descriptive `aria-label` (e.g., 'clear search' instead of 'cancel') must be provided.
**Action:** Always conditionally render both the icon element and the `withTrailingIcon` property together to prevent inaccessible hidden focus states, and use descriptive ARIA labels.
