# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-11-20 - Set.prototype.has over Array.prototype.includes

**Learning:** Using `Array.prototype.includes` inside `Array.prototype.filter` or loop iterations over large datasets creates an O(N*M) time complexity, potentially blocking the main thread significantly.
**Action:** Always precompute a `Set` before loop operations and replace O(N) `Array.includes` with O(1) `Set.has` to keep time complexity to O(N+M).
