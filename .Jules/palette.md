## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Contextual Icons in Search Inputs
**Learning:** Using a persistent 'cancel' icon inside a search input gives a false affordance when the input is empty. A better pattern is to show a disabled 'search' icon by default, swapping to an enabled 'clear' icon only when text is present, ensuring appropriate ARIA labels for each state.
**Action:** Replace static trailing icons in text fields with dynamic icons based on input value to clarify interaction intent and state.
