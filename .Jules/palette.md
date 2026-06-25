## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-11-20 - Ensure trailing clear icon buttons correctly hide for empty fields and resets reactive lists

**Learning:** When using reactive lists in Svelte filtering based on text inputs (like an autocomplete search string binding logic), the user may get stuck if the search is empty but the bound list is not reset or when the clear icon button is clicked. Moreover, unconditionally rendering trailing "clear search" icons in an empty text field breaks keyboard accessibility as the icon still receives focus without having an action or state to revert.
**Action:** Always conditionally render both the HTML elements representing the trailing icons (e.g. `{#if search !== ''}`) and set dynamic boolean props on parent inputs (e.g. `withTrailingIcon={search !== ''}`). When setting up reactive statements targeting input strings, guarantee that the empty string edge cases reset their mapped list by writing explicitly handled fallbacks.
