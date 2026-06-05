# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - Svelte Debounce Search State Invalidation

**Learning:** When using debounced inputs to trigger searches, failing to immediately abort or skip the debounce timeout when the input becomes empty or invalid leads to lingering UI states and wasted timeout allocations. The component must actively reset state variables (`domain`, `isLoading`, etc.) immediately within the debounce function when invalidity occurs, bypassing the timer entirely.
**Action:** Always inject validation checks within `debounce()` functions, clearing pending timeouts and resetting relevant data states immediately for empty or invalid inputs before scheduling any async tasks.
