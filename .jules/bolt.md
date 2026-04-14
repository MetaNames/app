# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-04-14 - Concurrent stats fetching

**Learning:** When fetching multiple independent statistics (like domain counts and recent domains), sequential await statements cause the total response time to be the sum of all requests. Using `Promise.all` allows these requests to execute concurrently, reducing the total time to the longest single request.
**Action:** Always look for sequential await statements that don't depend on each other's results and refactor them to use `Promise.all` for better concurrency.
