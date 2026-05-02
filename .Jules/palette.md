## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-10-25 - Fixing Dialog ID Mismatch
**Learning:** Hardcoded IDs in SMUI `Dialog` components cause `aria-labelledby` and `aria-describedby` to reference invalid or duplicate IDs when multiple components are rendered in loops. This creates severe accessibility violations.
**Action:** Use an `onMount` hook to dynamically generate and bind unique IDs for dialog titles and contents, ensuring proper ARIA reference resolution and uniqueness across instances.
