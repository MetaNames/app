# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.
## 2024-11-13 - Array Iteration and Lookup Optimization\n**Learning:** In SvelteKit API routes handling large data sets (like smart contract state), chaining `.filter()` with `.includes()` on arrays creates O(N*M) bottlenecks. Converting the lookup target to a `Set` first drastically reduces overhead. Additionally, using `.map()` purely for side-effects when building RPC payloads allocates unnecessary memory; a simple `for...of` loop is more efficient.\n**Action:** Profile data transformation pipelines in API routes. Always convert arrays to `Set` objects for O(1) lookups inside iteration functions, and replace `.map()` with `for...of` when the returned array is not used.
