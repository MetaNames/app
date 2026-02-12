## 2024-10-24 - [Svelte Search Optimization]
**Learning:** Using `on:keyup` for search inputs misses paste/drag events and triggers on navigation keys. Reactive statements `$: if (val !== null) debounce()` are superior for covering all input methods and reducing unnecessary calls.
**Action:** Prefer reactive statements over `on:keyup` for input-driven side effects.

## 2024-10-24 - [Async Race Conditions]
**Learning:** Async search functions without request ID tracking can lead to race conditions where a slow, stale request overwrites a newer, faster request.
**Action:** Always implement a `requestId` counter or variable capture in async search handlers to discard stale results.
