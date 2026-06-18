## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2025-02-13 - Conditional Icon Rendering for Clear Buttons
**Learning:** In SMUI Textfields, dynamically binding `withTrailingIcon={condition}` isn't always enough for accessibility and keyboard navigation. Even if the icon is visually hidden via CSS or the library's internal logic, an empty `aria-label` button wrapper might still be focusable if it remains in the DOM. Furthermore, using a generic `aria-label="cancel"` for a search clear button is ambiguous to screen readers.
**Action:** When implementing clearable search fields, use Svelte's `{#if ...}` to completely unmount the trailing icon wrapper from the DOM when the field is empty, bind the `withTrailingIcon` property to the same condition so the layout adjusts correctly, and use descriptive labels like `aria-label="clear search"`.
