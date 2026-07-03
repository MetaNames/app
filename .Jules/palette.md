## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-25 - Conditionally render clear buttons in SMUI Textfields
**Learning:** When using trailing icons for clear buttons in SMUI Textfields, keeping them rendered while empty leaves an unnecessary focusable element that clutters keyboard navigation.
**Action:** Conditionally render the clear button element itself (e.g., `{#if search !== ''}`) and dynamically bind the `withTrailingIcon` property to the same condition to maintain correct layout. Also use specific ARIA labels like "clear search" instead of generic ones like "cancel".
