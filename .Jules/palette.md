## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2025-01-22 - Hide and Disabling Empty Textfield Icons

**Learning:** When conditionally rendering a trailing icon inside an SMUI Textfield component (e.g. a clear search button), failing to dynamically adjust `withTrailingIcon` can leave the button visually apparent and incorrectly focusable even when its text input relies on empty state. Additionally using a generic "cancel" aria-label does not accurately describe the clear search intent.
**Action:** Always conditionally render the icon element (e.g., `{#if search !== ''}`) and dynamically bind the `withTrailingIcon` property to the same condition so it is not focusable and the layout updates correctly. Also, replace generic labels with a descriptive `aria-label` like "clear search".
