## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-05-19 - Ensure conditional elements inside inputs don't leave dead focus stops
**Learning:** When rendering a clear icon inside SMUI textfields, the empty element is still part of the tab sequence. We also need to conditionally disable the padding.
**Action:** Wrap the icon button inside `{#if value !== ''}` and dynamically set `withTrailingIcon={value !== ''}`.
