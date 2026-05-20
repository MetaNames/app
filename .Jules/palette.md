## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2026-05-20 - Better Clearable Inputs in SMUI
**Learning:** When adding a clear button (trailing icon) inside an SMUI `Textfield` for search inputs, the button remains keyboard focusable even when the input is empty and the button shouldn't be clicked. Also, reactive statements filtering on search input need an explicit `else` reset so that keyboard clearing resets the list correctly.
**Action:** Always wrap the clear button in a conditional block (e.g., `{#if search !== ''}`) so it's not focusable when empty, bind `withTrailingIcon` dynamically to update the layout, ensure an `aria-label` describes the action clearly (e.g., 'clear search' instead of 'cancel'), and add an `else` clause to search reactivity.
