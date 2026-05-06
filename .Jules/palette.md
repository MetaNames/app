## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-05-06 - Fixing Search Bar State and Clear Button

**Learning:** When using reactive statements like `$: if (search !== '')` to filter lists in Svelte, it is essential to include an `else` block to reset the state when the input is cleared. In SMUI Textfields, dynamically rendering the trailing icon requires both wrapping the slot content in an `{#if}` block and binding `withTrailingIcon={condition}` on the Textfield itself to maintain correct internal padding and layout.
**Action:** Always test search and clear interactions completely (including keyboard deletion). Ensure `withTrailingIcon` dynamically matches the trailing icon rendering condition. Ensure aria-labels are descriptive of the action rather than the icon name itself (e.g., "clear search" vs "cancel").
