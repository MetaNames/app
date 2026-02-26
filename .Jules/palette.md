## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Dynamic Search Results Accessibility

**Learning:** Dynamic content updates like search results are often invisible to screen readers unless explicitly marked. Wrapping the results container in an `aria-live="polite"` region ensures that changes (loading, results found, etc.) are announced without interrupting the user's current action.
**Action:** Use `aria-live="polite"` for non-critical dynamic updates to keep users informed of content changes.
