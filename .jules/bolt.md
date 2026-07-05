# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.
## 2024-11-20 - Set for O(1) Lookups in Large Array Filtering

**Learning:** When filtering large lists (like `owners` against `voters`), using `Array.prototype.includes()` inside `.filter()` results in an O(N*M) complexity. This causes significant performance degradation as both lists grow.
**Action:** Always precompute a `Set` before the filter loop to convert the O(N) array lookup into an O(1) set lookup, improving the overall complexity to O(N).
