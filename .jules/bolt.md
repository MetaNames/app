# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-05-23 - Set vs Array Lookup Performance

**Learning:** When filtering a large array based on whether its elements exist in another array, using `.includes()` inside `.filter()` results in an O(N * M) time complexity. This becomes a significant bottleneck for large arrays. Converting the lookup array into a `Set` before filtering reduces the time complexity to O(N), changing the operation time from hundreds of milliseconds to just a few milliseconds.
**Action:** Always convert lookup arrays to `Set`s when performing inclusion checks inside loops or filter operations on large datasets.
