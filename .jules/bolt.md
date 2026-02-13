# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2025-02-13 - Reactive Statements for Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing is inefficient and incomplete; it triggers on non-character keys (e.g., Shift, Arrow keys) and misses alternative input methods like paste or drag-and-drop. Svelte's reactive statements (e.g., `$: debounce(value)`) provide a robust, comprehensive way to trigger side effects only when the value actually changes.
**Action:** Prefer reactive statements over key event listeners for debouncing bound inputs to improve performance and UX consistency.
