# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - Array Sort Memory Overhead

**Learning:** Destructuring and instantiating new arrays inside a `.sort()` comparison callback (e.g., `const [aVal, bVal] = [a, b].reverse()`) causes massive garbage collection overhead because it creates a new array object for every single comparison (which happens O(N log N) times).
**Action:** Avoid allocating memory within tight sorting loops. Use direct property access and standard `if` blocks or ternary operators for conditionals to prevent unnecessary GC pressure.
