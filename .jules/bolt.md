## 2024-05-23 - Domain Search Race Condition
**Learning:** Asynchronous typeahead searches in SvelteKit must implement a request ID mechanism to discard stale responses. `on:keyup` triggers excessive events and misses some inputs; `on:input` is preferred for correctness and efficiency.
**Action:** Always wrap async search handlers with a request ID check and use `on:input` for text fields.
