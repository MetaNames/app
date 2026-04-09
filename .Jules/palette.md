## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2026-04-09 - Contextual Search Icons

**Learning:** Showing a 'clear' icon in an empty search input creates a false affordance, as there's nothing to clear. This can cause user confusion.
**Action:** Use contextual icons (e.g., a disabled 'search' magnifying glass when empty, and an enabled 'clear' icon when text is present) in search inputs to provide accurate interaction cues and prevent false affordances. Ensure `aria-label`s reflect the active icon's purpose.
