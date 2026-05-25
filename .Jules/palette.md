## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-25 - Trailing Icons in SMUI Textfields
**Learning:** When conditionally displaying trailing icons (like a clear button) in an SMUI Textfield, ensuring the component's `withTrailingIcon` property matches the condition is critical for layout to update correctly. Furthermore, invisible or empty icons remain focusable by screenreaders and keyboards if not conditionally rendered out using `{#if}` blocks.
**Action:** Always wrap trailing icons inside a conditionally rendered block (`{#if search !== ''}`) and dynamically bind `withTrailingIcon` to the exact same condition. Additionally, apply a descriptive `aria-label` like "clear search" to replace generic terms like "cancel".
