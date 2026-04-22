# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-11-20 - Set Optimization

**Learning:** When performing array lookups inside a loop (like `Array.includes` inside `Array.filter`), the time complexity becomes O(N * M). Converting the lookup array to a `Set` before the loop changes this to O(N + M), resulting in a massive speedup (~100x faster for arrays of size 5000-10000 in this project).
**Action:** Always watch for `.includes` or nested loops during filtering/mapping. Pre-compute lookups with `Set` or `Map` to avoid O(N * M) performance degradation.
