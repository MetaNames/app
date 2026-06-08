## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-11-20 - Stale UI States in Search Filters
**Learning:** Svelte reactive search filters and debounced inputs require explicit reset logic for empty states to prevent confusing stale UI results.
**Action:** Always ensure an 'else' block or default reset path exists when an input becomes empty.
