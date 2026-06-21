## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2024-10-24 - Conditionally Rendering Trailing Icons

**Learning:** When using components like SMUI's `Textfield` that conditionally display clear/cancel trailing icons based on input state, dynamically binding `withTrailingIcon` to that condition is crucial. If `withTrailingIcon` is true while the icon itself is not rendered (e.g. `{#if search !== ''}`), layout issues or empty focus states can occur. Furthermore, setting a descriptive `aria-label` (like "clear search" instead of "cancel") greatly improves accessibility for screen readers interacting with these interactive elements.
**Action:** Always conditionally bind `withTrailingIcon` and ensure the icon itself is only rendered when necessary, providing specific and descriptive `aria-label` attributes to the buttons.
