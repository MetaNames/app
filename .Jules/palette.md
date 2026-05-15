## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.
## 2026-05-15 - Svelte Reactive Reset & Conditional A11y
**Learning:** Reactive filters in Svelte (e.g. `$: if (search) { filter() }`) must include an `else` block to reset state, otherwise clearing the input leaves stale data. Furthermore, decorative or conditional UI elements like "clear search" trailing icons should be wrapped in `{#if}` blocks to prevent screen readers from focusing them when they're conceptually hidden.
**Action:** Always provide an `else` reset for reactive state derivations and structurally hide focusable elements using `{#if}` when they logically shouldn't exist, updating their `aria-label` to be descriptive.
