# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-26 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for debouncing search inputs is inefficient as it triggers on navigation keys (arrows, home, end) which don't change the value. It also misses paste events.
**Action:** Use a reactive statement `$: debounce(value)` to trigger debouncing only when the value actually changes.
