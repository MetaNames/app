## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-25 - Search Input Reset and Focus Accessibility
**Learning:** Reactive filters in Svelte need an explicit fallback (e.g., `else`) to clear state when an input empties. Additionally, trailing icons (like a 'clear search' button) in `Textfield` components should be conditionally rendered and their wrapper bound dynamically (`withTrailingIcon={search !== ''}`) so they don't incorrectly receive focus or announce poorly to screen readers when no text is present.
**Action:** Add default fallback states for reactive filtered data. Wrap clear/trailing icons in `{#if value !== ''}` and assign meaningful `aria-label`s like 'clear search' instead of 'cancel'.
