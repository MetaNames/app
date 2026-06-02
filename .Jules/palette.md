## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-10-25 - Trailing Icons Accessibility
**Learning:** When a trailing icon in a textfield (like a clear button) is empty, it can still be focusable and read as empty or 'cancel' by screen readers, creating a confusing experience.
**Action:** Conditionally render the icon itself (e.g., `{#if search !== ''}`) so it is not focusable when empty. Dynamically bind `withTrailingIcon={search !== ''}` and use a descriptive `aria-label` like 'clear search'.
