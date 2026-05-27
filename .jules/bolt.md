# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2026-05-27 - Array.includes() in API Endpoints

**Learning:** Filtering arrays against other arrays using `.includes()` creates an O(N\*M) performance bottleneck, which is especially noticeable in APIs processing large lists (e.g. voters vs owners).
**Action:** Always convert the target array into a `Set` (O(N) operation) and use `.has()` for O(1) lookups during filtering to achieve overall O(N+M) time complexity.
