## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2026-05-26 - Accessible Clear Buttons in Search Inputs

**Learning:** Conditionally rendering a trailing icon (like a clear button) inside an SMUI `Textfield` component requires dynamically binding the `withTrailingIcon` property to the same condition so layout updates correctly. Otherwise, an empty search input might maintain a trailing icon layout with a hidden button. Additionally, the clear button should have a descriptive `aria-label` (e.g., 'clear search' instead of 'cancel') and should only be rendered when the input has value so that keyboard users aren't forced to focus on a hidden/inactive button.
**Action:** Use `withTrailingIcon={search !== ''}` when conditionally rendering trailing icons in SMUI Textfields, ensure conditionally rendered clear buttons are inside an `{#if search !== ''}` block, and use descriptive `aria-label`s like 'clear search'.
