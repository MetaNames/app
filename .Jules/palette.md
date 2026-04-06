## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Contextual Icons in Search Inputs

**Learning:** Using a persistent "cancel" icon in search inputs when there is no text provides a false affordance. It can confuse users who expect it to be a submit button. Also, the `aria-label` must accurately reflect the action ("clear search" instead of "cancel").
**Action:** Always implement contextual icons in search inputs: a disabled magnifying glass "search" icon when empty, which switches to an enabled "clear" icon when text is present. Ensure `aria-label` is updated accordingly.
