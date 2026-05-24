## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2026-05-24 - Conditionally render trailing clear icons in SMUI Textfields

**Learning:** When adding a clear button as a trailing icon to an SMUI Textfield, it shouldn't just be visually hidden or left in place when the input is empty. If it remains in the DOM, it's still focusable by keyboard navigation, which confuses users since clicking 'clear' on an empty input does nothing. Furthermore, reactive statements filtering based on search text (e.g. `$: if (search !== '')`) won't reset the list if the user simply deletes the query with the keyboard unless an `else` branch is provided.

**Action:** Always wrap the trailing icon content in an `{#if search !== ''}` block, dynamically bind the textfield's `withTrailingIcon={search !== ''}` property so layout updates appropriately, and ensure reactive filters include an `else` clause that resets the filtered list back to the original list. Also, use a descriptive ARIA label like 'clear search' instead of 'cancel'.
