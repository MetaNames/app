## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2026-06-04 - Search input trailing icon accessibility and state fallback

**Learning:** In Svelte Material UI (SMUI), trailing icons inside Textfields remain focusable even when empty, which can confuse screen reader users, and reactive Svelte arrays need explicit `else` block resets.
**Action:** Always wrap `svelte:fragment slot="trailingIcon"` contents in an `{#if value !== ''}` and bind `withTrailingIcon={value !== ''}` to conditionally render the icon button, ensuring it is only accessible when the input has content. Also ensure reactive filtering blocks like `$: if (search !== '')` include an `else` branch to correctly reset data arrays to default.
