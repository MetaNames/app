# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - Array Filtering Optimization

**Learning:** Using `Array.prototype.includes` inside `Array.prototype.filter` creates an O(N*M) operation, which can cause performance bottlenecks with large blockchain arrays like `owners` and `voters`. Converting the lookup array into a `Set` before filtering reduces the time complexity to O(N).
**Action:** Always convert lookup arrays to Sets when filtering over potentially large arrays to ensure O(1) lookups and maintain scaleable performance.
