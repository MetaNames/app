## 2024-10-25 - Race Condition in Async Search
**Learning:** Async search functions triggered by user input can cause race conditions where a stale response overwrites a fresh one. Using a request ID counter and capturing local state is a robust fix.
**Action:** Always implement a request ID or cancellation token for typeahead search components.
