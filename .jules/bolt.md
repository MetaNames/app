# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - API Route Tradeoffs with Promise.all

**Learning:** When trying to eliminate waterfall requests using `Promise.all` in an API route, consider error/failure paths. Executing requests concurrently means you might perform an expensive query *before* a validation check fails. In some cases, like verifying a voting deadline before fetching a heavy list of owners, the sequential waterfall is actually better for performance on the failure path than a concurrent execution that over-fetches.
**Action:** Always evaluate the tradeoffs between "happy path" speed (concurrency) and "failure path" efficiency (sequential short-circuiting). Do not use `Promise.all` blindly across validation boundaries.
