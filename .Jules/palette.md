## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Conditional Trailing Icons for Accessibility
**Learning:** When using trailing icons in text fields (like a clear button), the icon remains focusable by keyboard even when it is visually unnecessary (e.g. empty input). Also, binding the `withTrailingIcon` property to a condition is necessary for proper layout updates.
**Action:** Always conditionally render trailing icons (e.g., `{#if search !== ''}`) so they are not focusable when irrelevant. Also bind `withTrailingIcon` to the same condition and use descriptive aria-labels (e.g. 'clear search').
