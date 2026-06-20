## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-10-24 - Search Input State and Conditional Icons
**Learning:** Reactive search filters must explicitly handle the empty state (via an `else` block) to reset results when the user clears the input. Additionally, conditionally rendered trailing icons in SMUI Textfields must dynamically bind `withTrailingIcon={condition}` and only render the icon element when the condition is true to prevent empty focusable elements. Using a descriptive `aria-label` like "clear search" is better than a generic "cancel".
**Action:** Always include an explicit reset path in reactive search blocks. When conditionally showing a trailing clear button in a Textfield, bind the `withTrailingIcon` property to the same condition and wrap the slot content in an `#if` block. Use descriptive `aria-label`s.
