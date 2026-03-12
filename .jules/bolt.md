# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-11-20 - Array Allocation inside Sort Comparators

**Learning:** Svelte reactive handlers and sorts that use array destructuring and array generation methods (like `.slice()` or `.reverse()`) within an `Array.prototype.sort()` comparator execute on *every comparison* ($O(N \log N)$). This creates massive garbage collection churn and latency for large collections.
**Action:** Always extract static references or use direct scalar property access with conditional swapping instead of instantiating new arrays inside a sort comparator.
