## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-25 - Trailing Icons and Search Filtering Resets

**Learning:** When using reactive variables for search filtering (`$: if (search !== '') ...`), failing to add an `else` block causes the UI to freeze in the filtered state when the user clears the input with backspace. Also, when an SMUI `Textfield` has a dynamic trailing icon, its `withTrailingIcon` attribute must be bound to the same condition; leaving it statically `true` leaves a gap in the UI when the icon unmounts.
**Action:** Always include an `else` clause to restore the original list when the search is cleared, and dynamically bind `withTrailingIcon` to the presence of the search query. And always make sure the clear button has an accessible label like "Clear search".
