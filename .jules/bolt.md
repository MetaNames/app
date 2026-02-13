# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-24 - [Svelte Search Optimization]
**Learning:** Using `on:keyup` for search inputs misses paste/drag events and triggers on navigation keys. Reactive statements `$: if (val !== null) debounce()` are superior for covering all input methods and reducing unnecessary calls.
**Action:** Prefer reactive statements over `on:keyup` for input-driven side effects.
