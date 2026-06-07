## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-25 - Conditional Rendering of Interactive Elements inside Input Fields

**Learning:** In SMUI `Textfield` components, unconditionally rendering trailing icons (like a "clear search" button) can result in these elements being incorrectly focusable when empty.
**Action:** When conditionally rendering a trailing icon inside an SMUI `Textfield`, ensure the element itself is hidden (`{#if value !== ''}`) and dynamically bind `withTrailingIcon` to the same condition. Use descriptive `aria-labels` like "Clear search" rather than generic ones.
