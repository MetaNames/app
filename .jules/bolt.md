# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-11-20 - Set.has() vs Array.includes()

**Learning:** When filtering large arrays against a lookup array using `.includes()` inside a loop, the operation is O(N * M), leading to poor performance. Converting the lookup array into a `Set` before the loop changes the operation to O(N), offering a significant performance boost for larger datasets (e.g., voters list).
**Action:** Use `Set.has()` instead of `Array.includes()` inside loops when the lookup array is non-trivial in size.
