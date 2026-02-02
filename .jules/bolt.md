## 2024-10-24 - Race Conditions in Typeahead Search

**Learning:** In asynchronous typeahead search (debounced or not), network responses can arrive out of order, causing the UI to display results that don't match the current input. This is especially critical when "perceived performance" is high but network latency varies.
**Action:** Implement a request ID (or timestamp) mechanism. Capture the ID before the async call and verify it matches the current ID after the call completes. If they don't match, discard the stale result. This ensures correctness without needing complex cancellation logic (AbortController), though AbortController is better for saving bandwidth.
