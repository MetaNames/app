## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Contextual Icons in Search Inputs

**Learning:** Using a persistent 'cancel' or 'clear' icon in a search input when the input is empty creates a false affordance, implying there is text to clear when there isn't. It is confusing for users.
**Action:** Always conditionally render the icon in search inputs: show a disabled magnifying glass (or no icon) when empty, and transition to a functional 'clear' icon when text is present. Ensure `aria-label` attributes accurately reflect the current state and function.
