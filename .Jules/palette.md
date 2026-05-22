## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-05-22 - Proper Textfield Search UX/Accessibility
**Learning:** Svelte reactive statements need explicit `else` clauses for UI states like search results filtering. Without it, when the search input gets cleared, the initial state won't reset. Conditionally rendering a trailing icon inside an SMUI `Textfield` must also dynamically bind `withTrailingIcon` and the inner `#if` block using the same condition so it isn't focusable when hidden. The aria-label should also be descriptive, e.g. 'clear search'.
**Action:** Always provide else fallbacks on filtered lists. Always sync trailing icon attributes to visibility logic to avoid invisible focus stops.
