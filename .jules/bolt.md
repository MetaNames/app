# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2025-01-28 - Optimizing Array Intersections

**Learning:** When performing intersection checks between two large arrays (e.g., `arrayA.filter(x => arrayB.includes(x))`), using `.includes()` inside `.filter()` results in O(N*M) time complexity. This can cause significant slowdowns as the arrays grow.
**Action:** Always convert the target array into a `Set` before filtering to achieve O(1) lookups, reducing the time complexity to O(N+M). This is especially critical in API endpoints like `/add` and `/remove` where these checks are performed frequently.
