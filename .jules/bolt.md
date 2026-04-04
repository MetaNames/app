# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-05-23 - Domain Search Caching Re-eval

**Learning:** When dealing with asynchronous request races in typeahead searches, cache insertion shouldn't be gated by the `requestId` check if it can still benefit future interactions. If a user quickly hits backspace, the earlier request completes after the `requestId` has advanced; dropping its cache insertion entirely wastes an otherwise successful network call that could instantly satisfy a subsequent keystroke.
**Action:** Always write to the cache unconditionally upon network success (subject to size limits) but still gate the local component state update using the `requestId`.
