## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Conditional Focusable Trailing Icons
**Learning:** When conditionally rendering a trailing icon inside a component like SMUI Textfield, ensure the icon element itself is conditionally rendered (e.g. {#if search !== ''}) so it's not focusable when empty. Additionally, dynamically bind layout properties like `withTrailingIcon` to the same condition and use descriptive aria-labels (e.g., 'clear search' instead of 'cancel').
**Action:** Always wrap trailing icon elements in an explicit {#if} block if they should only appear contextually and update aria-labels to describe the action precisely.
