# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-26 - Symmetric Set Operations in APIs

**Learning:** When dealing with large lists in API endpoints (like `owners` and `voters` arrays), replacing `Array.includes()` inside `Array.filter()` loops with a `Set.has()` lookup reduces time complexity from O(n²) to O(n). This is especially critical for contract operations where lists can grow unbounded.
**Action:** Always convert the target array to a `Set` before running a filter loop when checking for membership, and apply these optimizations symmetrically across related endpoints (e.g., both `add` and `remove` operations).
