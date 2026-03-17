# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-05-23 - Client-side Caching bounded by session duration

**Learning:** Caching bounded by session duration in Svelte applications is best accomplished by using a module-scoped `Map` in `<script context="module">`. This effectively caches repetitive data fetches (like identical user queries) while preventing the cache from growing indefinitely (since it resets on app reload/session end).
**Action:** Always prefer module-scoped `Map`s for caching over stores if the data doesn't require reactivity to update the UI on change, but rather needs to provide data quickly.
