# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-26 - Svelte Module Scope Caching

**Learning:** Svelte's `<script context="module">` is a perfect, lightweight alternative to global stores for persistent component-level caching. Variables declared here persist across component mount/unmount cycles and navigations, making it ideal for caching local search results (like domain lookups) without cluttering the global state.
**Action:** Use module-scoped variables for component-specific caching (like a `Map` of search results) to improve performance on repeated searches.
