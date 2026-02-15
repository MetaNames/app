## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - In-Place Loading Indicators

**Learning:** Replacing static icons (like search) with loading spinners within the same container (e.g., input field) prevents layout shifts and provides immediate, contextual feedback.
**Action:** Use conditional rendering to swap icons for spinners in `trailingIcon` slots or button contents during async operations.
