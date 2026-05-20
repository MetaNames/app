# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2026-05-20 - Optimize Array Lookups using Sets
**Learning:** When performing `.filter(item => !lookupArray.includes(item))`, the time complexity is O(N * M), which is an inefficient pattern, particularly for larger arrays such as API domain endpoints that deal with domain owners and voters. Converting the `lookupArray` to a `Set` and utilizing `Set.has()` changes this complexity to an optimal O(N) since Set lookups are O(1). Additionally, when this array-to-Set performance optimization is needed, it must be symmetrically applied to related endpoints (e.g., both the `add` and `remove` voters endpoints) to maintain uniform codebase efficiency.
**Action:** When filtering arrays against another array in list management API endpoints, always convert the lookup array into a `Set` before the loop to optimize O(N * M) performance to O(N). Also, identify and apply symmetrical performance optimizations to related endpoints.
