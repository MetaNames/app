## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2026-05-23 - Conditional Trailing Icons and Search Filtering

**Learning:** When implementing a clear button as a trailing icon in an SMUI Textfield, if the icon is only hidden via CSS but still rendered in the DOM, it can receive keyboard focus even when the input is empty. Additionally, Svelte reactive search filters need an `else` clause to correctly reset the list when the user clears the input via keyboard (backspace/delete).
**Action:** Conditionally render the trailing icon element (e.g., `{#if search !== ''}`), dynamically bind `withTrailingIcon` to the same condition, use a descriptive `aria-label` like 'clear search', and always include an `else` block in reactive array filters to reset state.
