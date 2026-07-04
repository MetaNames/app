## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-25 - Conditional Trailing Icons in SMUI Textfields
**Learning:** Trailing icons (like clear buttons) inside SMUI `Textfield` components remain focusable and take up layout space even when they shouldn't be active (e.g., when a search input is empty).
**Action:** Conditionally render the icon element (e.g., `{#if search !== ''}`) to remove it from the focus order and dynamically bind the `withTrailingIcon` property to the same condition so the layout updates correctly. Use descriptive `aria-label`s like "clear search" instead of generic names.
