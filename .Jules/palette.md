## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-25 - Contextual Icons in Search Inputs

**Learning:** Using a persistent 'cancel' icon in search inputs when no text is present creates a false affordance.
**Action:** When implementing search inputs, use contextual icons (e.g., a disabled 'search' magnifying glass when empty, and an enabled 'clear' icon when text is present) rather than a persistent 'cancel' icon to prevent false affordances. Ensure `aria-label`s reflect the active icon's purpose (e.g., `aria-label="clear search"`).
