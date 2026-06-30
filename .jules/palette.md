## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2024-10-25 - Trailing Icons in SMUI Textfields

**Learning:** When conditionally rendering a trailing icon inside an SMUI `Textfield` component, the `withTrailingIcon` prop must dynamically match the conditional rendering of the icon slot itself. If `withTrailingIcon` is persistently true while the icon is conditionally removed, it creates accessibility and layout issues. Additionally, an empty trailing icon button should be completely removed from the DOM to prevent screen readers and keyboard users from focusing on an inactive element.
**Action:** Always bind the `withTrailingIcon` property to the same condition used to render the trailing icon slot (e.g., `withTrailingIcon={search !== ''}` and `{#if search !== ''}`).
