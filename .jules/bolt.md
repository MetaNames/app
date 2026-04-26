# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-04-26 - O(N*M) Array.includes() Performance Bottleneck

**Learning:** In nested array operations (like filtering an array of N elements by checking `.includes()` against another array of M elements), the time complexity becomes O(N*M), which degrades performance significantly for large lists.
**Action:** Convert the lookup array into a `Set` before the loop. The `Set.has()` method provides O(1) lookup time, reducing the overall complexity to O(N) and improving execution time drastically.
