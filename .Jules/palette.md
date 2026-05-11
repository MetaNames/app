## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Search Input UX/A11y

**Learning:** Search inputs often leave clear buttons focusable and visible to screen readers even when the input is empty. Also, `cancel` as an aria-label isn't clear enough about what action the user is taking.
**Action:** Always conditionally render clear buttons (e.g., `{#if search !== ''}`) so they only exist when usable, and use a descriptive aria-label like `"clear search"` instead of generic terms like `"cancel"`.
