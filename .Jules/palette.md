## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Accessibility of Dynamic Search Results
**Learning:** Search results that update asynchronously without a page reload are often missed by screen readers if not announced. This is critical for users who rely on non-visual feedback to know when results are available.
**Action:** Wrap the dynamic results container in an element with `aria-live="polite"` to ensure updates are announced without interrupting the user.
