## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Input Field Loading Indicators

**Learning:** When implementing debounced search inputs, relying solely on a separate results area loader disconnects the feedback from the user's action (typing). Users expect immediate validation that their input is being processed.
**Action:** Always include a small, inline loading indicator (spinner) within the input field itself (e.g., trailing icon slot) for async search operations, ensuring it has `role="status"` and `aria-label`.
