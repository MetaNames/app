## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Dynamic Search Icons and Reactivity Reset
**Learning:** Svelte reactive statements used for filtering data (`$: if (search !== '') { filtered = items }`) often miss the reset state if they omit the `else` clause. When a user deletes their search query via keyboard, the list won't reset. Additionally, trailing icons in components like SMUI Textfields must be dynamically bound (`withTrailingIcon={condition}`) to adjust layout correctly when the icon is conditionally hidden to avoid empty padded space.
**Action:** Always include an `else` clause in search filtering reactive statements and ensure component properties (like padding flags) are dynamically synced with conditionally rendered child elements.
