# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.
## 2026-04-24 - Array Loop Optimization
**Learning:** Replacing an O(N * M) `.includes()` lookup inside a `.filter()` loop with a Set `.has()` lookup (O(1)) significantly improves algorithmic efficiency for large arrays, converting the total time complexity to O(N).
**Action:** Use Sets instead of array `.includes()` when filtering or iterating over arrays based on membership in another array, specifically in server-side endpoints processing lists (like `voters/add` and `voters/remove`).
