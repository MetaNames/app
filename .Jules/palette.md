## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-10-25 - Conditionally Rendered Trailing Icons in Textfields
**Learning:** Conditionally rendering just the icon inside a trailing icon slot still leaves the trailing icon button focusable and taking up space when empty.
**Action:** Ensure the entire trailing icon fragment/element is conditionally rendered and the `withTrailingIcon` property is bound to the same condition.
