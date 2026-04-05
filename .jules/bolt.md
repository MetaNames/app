# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-05-24 - Array vs Set lookups inside filters

**Learning:** When filtering an array based on exclusions from another array, `Array.prototype.includes` within `.filter()` produces O(N*M) time complexity. This can take hundreds of milliseconds for arrays of 10,000+ items. Creating a Set beforehand and using `Set.prototype.has` converts this to O(N+M), dropping lookup time by ~98% (e.g. from ~450ms down to ~6ms).
**Action:** Always utilize a Set lookup for inclusion/exclusion checks inside Array iteration blocks.
