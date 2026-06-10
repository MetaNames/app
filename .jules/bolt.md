# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-06-10 - Array Methods in Sorting Callbacks
**Learning:** Creating arrays and calling methods like `[a, b].slice()` or `[a, b].reverse()` inside `Array.prototype.sort()` callbacks introduces heavy Garbage Collection overhead as it happens for every element comparison. In a table sort for example, avoiding these array allocations and instead using straightforward scalar comparisons makes the sort operation ~2.5x faster.
**Action:** Always use primitive scalar variables and direct comparison (e.g. mathematical negation `-result` for descending order) inside `sort()` callbacks instead of array destructuring and `.reverse()`/`.slice()`.
