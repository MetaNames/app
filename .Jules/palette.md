## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2026-05-09 - Conditionally Rendering Trailing Icons in SMUI Textfields
**Learning:** When conditionally rendering a trailing icon inside an SMUI `Textfield` component, ensure the `withTrailingIcon` property is dynamically bound to the same rendering condition (e.g., `withTrailingIcon={search !== ''}`) rather than left as a static boolean flag, otherwise the input's layout and padding will not update correctly when the icon is unmounted.
**Action:** Always bind the `withTrailingIcon` and `withLeadingIcon` flags in SMUI textfields to their corresponding DOM node's rendering state.
