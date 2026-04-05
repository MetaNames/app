## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-10-24 - Contextual Search Icons

**Learning:** Search inputs often have a persistent "search" icon. While this indicates it's a search field, once a user types, they more frequently need a way to clear typos quickly without selecting all text.
**Action:** Replace the static search icon with a contextual "clear" icon when the input is not empty, and ensure it functions as a button to clear the input, updating `aria-label` appropriately.
