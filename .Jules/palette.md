## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-11-20 - Dynamic Icons in Textfields and Search Resets

**Learning:** When adding a conditional trailing icon (like a clear button) inside an SMUI Textfield, leaving `withTrailingIcon` as a static boolean causes incorrect layout and padding when the icon is unmounted. Furthermore, Svelte reactive statements for search filtering (e.g., `$: if (search !== '') { filtered = all.filter(...) }`) require an explicit `else { filtered = all }` to correctly reset the list when users clear the input using backspace or delete.
**Action:** Dynamically bind `withTrailingIcon` to the same condition used to render the icon (e.g., `withTrailingIcon={search !== ''}`), and always include an `else` block to reset filtered lists to their default state when search strings become empty.
