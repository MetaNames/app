# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.
## 2026-05-07 - Optimize O(N*M) lookup in voters add/remove
**Learning:** When performing array intersection/difference operations like , the time complexity is O(N*M). In endpoints that process larger arrays (like  and ), this becomes a noticeable bottleneck. Converting the lookup array () to a  reduces the complexity to O(N).
**Action:** Always convert lookup arrays to s before using them inside loops or higher-order functions like  or  to ensure linear time complexity (O(N)) instead of quadratic (O(N*M)).
## 2024-10-24 - Optimize O(N*M) lookup in voters add/remove
**Learning:** When performing array intersection/difference operations like `arr1.filter(item => !arr2.includes(item))`, the time complexity is O(N*M). In endpoints that process larger arrays (like `voters` and `owners`), this becomes a noticeable bottleneck. Converting the lookup array (`arr2`) to a `Set` reduces the complexity to O(N).
**Action:** Always convert lookup arrays to `Set`s before using them inside loops or higher-order functions like `filter` or `map` to ensure linear time complexity (O(N)) instead of quadratic (O(N*M)).
