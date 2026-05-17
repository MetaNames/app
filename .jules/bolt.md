# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - Set Lookups for Array Intersection

**Learning:** When finding the difference or intersection between two arrays using `.filter()` and `.includes()`, the time complexity is O(N * M), which can be a bottleneck for large datasets.
**Action:** Always convert the lookup array to a `Set` before the loop and use `.has()`. This reduces the complexity to O(N + M) because Set lookups are O(1). Apply this symmetrically across related endpoints (e.g., add/remove endpoints).
