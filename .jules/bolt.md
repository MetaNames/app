# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-26 - O(N*M) Array Filtering Optimization

**Learning:** Using `Array.prototype.includes()` inside an `Array.prototype.filter()` loop over large datasets creates an O(N*M) performance bottleneck. In this specific application, comparing large arrays of `owners` against `voters` synchronously blocks the main thread.
**Action:** Always replace O(N) lookup operations like `.includes()` inside loops with an O(1) `Set.prototype.has()` check by precomputing a Set before the loop, reducing overall complexity to O(N + M).
