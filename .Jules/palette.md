## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Trailing Icons and Reactive List Resetting

**Learning:** When conditionally rendering an `Icon` inside an SMUI `Textfield` slot (e.g. `trailingIcon`), the `withTrailingIcon` attribute must be bound to the exact same condition. Leaving it as a static boolean while unmounting the inner content breaks the layout padding. Additionally, reactive list filters (e.g., `$: if (search !== '') filtered = all.filter(...)`) fail to reset the list when users clear the input with backspace/delete.
**Action:** Bind SMUI's `withTrailingIcon={condition}` and only render the icon slot content `{#if condition}`. For reactive filters, always include an `else { filtered = all }` block to handle keyboard-based input clearing correctly.
