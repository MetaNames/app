## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2024-05-10 - Clear Input Affordances and Svelte Reactivity

**Learning:** When using conditional statements to filter arrays in Svelte based on an input's string value, it is critical to implement the `else` logic so the array correctly resets to its initial state when the string becomes empty. Furthermore, ensuring that interactive clear buttons are hidden when there is no text visually declutters the component and provides a more intuitive UX, while a descriptive `aria-label` like "Clear search" improves screen-reader accessibility over generic labels like "cancel".
**Action:** Always include an `else` clause when binding reactive list filtering to input value length, hide clear inputs conditionally with `{#if value !== ''}`, and rigorously audit `aria-label`s on icon-only buttons for action-specific descriptions.
