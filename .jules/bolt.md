# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-31 - Debouncing Empty Inputs

**Learning:** When users quickly clear a search input, standard `setTimeout` debouncing still triggers after the delay, wasting API calls and potentially displaying stale UI states if the async operation doesn't cleanly abort on empty strings.
**Action:** When debouncing search inputs, immediately intercept an empty value (`""`) to clear the timeout, reset UI state, and invalidate any pending `requestId` to prevent unnecessary execution and reduce GC/network overhead.
