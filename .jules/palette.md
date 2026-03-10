## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-24 - Unique ARIA IDs in Loop Components

**Learning:** When rendering multiple dialogs or hidden elements within a loop (e.g., a list of domain records), using static `id`s for `aria-labelledby` and `aria-describedby` results in duplicate DOM IDs. This causes screen readers to announce incorrect or generic descriptions.
**Action:** Ensure that all components rendered within a loop generate dynamically unique IDs (e.g., based on the item's label or index) for ARIA attributes and their corresponding target elements to maintain accessibility compliance.