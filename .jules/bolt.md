# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-11-20 - Array Sort Garbage Collection Overhead

**Learning:** Creating new arrays (e.g., `[a[sort], b[sort]]`) and using array methods like `.slice()` or `.reverse()` inside `Array.prototype.sort()` comparator functions creates severe garbage collection overhead, especially for large datasets. This is because the comparator is called $O(N \log N)$ times per sort.
**Action:** Always use direct variable assignment and conditional swapping (e.g., `const temp = a; a = b; b = temp;`) inside sort comparators to prevent excessive object allocation.
