# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.
## 2024-11-20 - Set Optimization in Hot Paths
**Learning:** Array lookup methods like `.includes()` create performance bottlenecks inside `.filter()` operations on medium-to-large datasets (O(N*M) complexity). Pre-computing a `Set` and using `.has()` transforms this to O(N).
**Action:** Use `Set` instances for exclusion/inclusion checks over multiple items to avoid O(N*M) lookups, especially in API endpoints performing state diffs.
