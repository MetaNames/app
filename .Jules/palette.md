## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-10-24 - Conditionally Rendering Input Icons and Filter Reactivity
**Learning:** Trailing icons in Svelte Material UI inputs (like clear buttons) must be conditionally rendered (e.g. `{#if search !== ''}`) so they are not focusable when empty. Additionally, Svelte reactive statements for search filters (e.g., `$: if (search !== '')`) need an `else` clause to properly reset the list when the search is cleared via backspace.
**Action:** Conditionally render trailing icons and bind the `withTrailingIcon` property to the same condition. Always include an `else` clause in reactive search filter statements to handle the empty state.
