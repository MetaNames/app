# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.
## 2024-11-06 - Array filtering with Set for O(1) Lookups

**Learning:** Using `Array.includes()` within a `.filter()` operation on large datasets (like synchronizing voters and owners arrays) results in O(n²) time complexity. This can cause significant blocking in server endpoints.
**Action:** Always convert the lookup array into a `Set` and use `Set.has()` when filtering one array based on the contents of another to achieve O(n) complexity.
