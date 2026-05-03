## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2026-05-03 - Svelte Reactive Array Filtering & SMUI Conditional Layout

**Learning:** When using Svelte reactive statements to filter lists based on search input (e.g., `$: if (search !== '') { filtered = all.filter(...) }`), the list does not automatically reset when the user clears the input via keyboard (backspace/delete) unless an explicit `else` clause (e.g., `else { filtered = all }`) is provided. Furthermore, conditionally rendering a trailing icon inside an SMUI `Textfield` component requires dynamically binding the `withTrailingIcon` property to the same rendering condition (e.g., `withTrailingIcon={search !== ''}`); otherwise, the input's layout and padding will not update correctly when the icon is unmounted.
**Action:** Always include an `else` clause in reactive search filter statements to handle the empty state, and ensure SMUI layout properties like `withTrailingIcon` match the conditional rendering state of their respective slots.
