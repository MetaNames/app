## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-11-20 - Clear Search Icon Accessibility and Reactivity
**Learning:** When conditionally rendering a trailing icon like a clear button in SMUI Textfield, the icon must not be focusable when empty. Also, when filtering a Svelte store based on input, ensure an 'else' block resets the data when the search becomes empty.
**Action:** Conditionally render the icon and bind `withTrailingIcon` to the same condition, use a descriptive aria-label, and ensure reactive filter statements have an else fallback.
