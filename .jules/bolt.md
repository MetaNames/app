# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.
## 2024-10-25 - Array vs Set in SvelteKit APIs\n**Learning:** Converting arrays to Sets before O(N * M) lookup operations (like `.filter(x => array.includes(x))`) in API endpoints like `voters/remove` and `voters/add` improves time complexity to O(N) and drastically reduces execution time (from ~340ms to ~7ms for 10k items).\n**Action:** Always pre-compute a `Set` from the target array when filtering large collections based on inclusion.
