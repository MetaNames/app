## 2024-10-24 - Async Search Caching
**Learning:** Adding a simple cache to async search inputs requires handling race conditions carefully. Specifically, manually triggering search (e.g., submit) should invalidate pending debounce timers to prevent double fetches.
**Action:** Always clear pending timers at the start of the async function execution, not just in the debounce wrapper.
