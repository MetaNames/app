# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - Avoid waterfall in metaNamesSdk
**Learning:** Sequential await operations involving `metaNamesSdk.domainRepository.count()`, `getOwners()`, and `getRecentDomains()` cause a waterfall latency, especially when communicating with the blockchain context or external services.
**Action:** Since these fetches are completely independent of each other, group them up and run them concurrently using `Promise.all` to save on round-trips latency and reduce execution time.
