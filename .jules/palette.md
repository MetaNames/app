## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-24 - Trailing Icons and Reactive Reset
**Learning:** When conditionally rendering a trailing icon inside an SMUI `Textfield` component, ensure the `withTrailingIcon` property is dynamically bound to the same rendering condition (e.g., `withTrailingIcon={search !== ''}`) rather than left as a static boolean flag, otherwise the input's layout and padding will not update correctly when the icon is unmounted. Also, when using Svelte reactive statements to filter lists based on search input (e.g., `$: if (search !== '') { filtered = all.filter(...) }`), always include an `else` clause (e.g., `else { filtered = all }`) to ensure the list correctly resets when the user clears the input via keyboard (backspace/delete).
**Action:** Always check the `withTrailingIcon` prop dynamically and double check reactive statements have complete conditional resets.
