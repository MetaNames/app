## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-11-06 - Accessible Trailing Icons in SMUI Textfields
**Learning:** Trailing icons in input fields (like clear buttons) should be conditionally rendered to prevent users from focusing on an empty action. Furthermore, dynamically binding `withTrailingIcon` to the same condition ensures layout consistency in SMUI components.
**Action:** Always conditionally render trailing interactive elements in input fields based on the input's value and use descriptive `aria-label`s instead of generic ones like "cancel".
