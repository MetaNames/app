# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2026-06-01 - Set-based Lookups for Array Filtering

**Learning:** When filtering large arrays using `.includes()` against another array, the operation becomes O(N*M), which degrades performance as the dataset grows. This was observed in list filtering API endpoints (`voters/add` and `voters/remove`).
**Action:** Always convert the lookup array into a `Set` to achieve O(1) lookups via `.has()`, reducing the time complexity of the filter operation to O(N).
