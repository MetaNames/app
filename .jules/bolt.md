# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2025-01-20 - Array.prototype.sort Comparator Overhead

**Learning:** Using array instantiation (e.g., `[aVal, bVal]`) and array methods (e.g., `.slice()` or `.reverse()`) inside a high-frequency `Array.prototype.sort()` comparator generates severe garbage collection overhead, drastically reducing sorting performance (by roughly 9x in benchmarks).
**Action:** Always use direct variable assignment and conditional swapping inside sorting comparators instead of relying on array methods.
