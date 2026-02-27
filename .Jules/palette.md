## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-24 - Deterministic Unique IDs for Dialog Accessibility in Loops

**Learning:** Hardcoded IDs for inner components (like `Title` and `Content`) in a `<Dialog>` break `aria-labelledby` and `aria-describedby` mappings when the dialog is rendered multiple times (e.g., inside an `{#each}` loop). This breaks accessibility for screen readers and produces invalid HTML due to duplicate IDs.
**Action:** Use deterministic props (like `klass` or `id`) to generate unique values for `id`, `aria-labelledby`, and `aria-describedby` attributes in dialogs rendered within a loop.
