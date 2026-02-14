## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Search Input Debounce Pattern

**Learning:** Using `on:keyup` for search inputs misses paste and drag-drop events, making the UI feel broken for non-typing interactions.
**Action:** Use a reactive statement `$: debounce(value)` instead of event listeners to catch all value changes reliably.
