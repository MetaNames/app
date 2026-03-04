## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-05-19 - Contextual Icon Swap for Search Inputs

**Learning:** Having an enabled "clear/cancel" icon in an empty search field can confuse users or give false affordance. A disabled search icon initially, which swaps to a functional "clear search" icon once text is present, establishes clearer intent and immediate feedback.
**Action:** When implementing search inputs, provide contextual icons: a disabled magnifying glass for an empty state, and an enabled "clear" button for a filled state. Ensure `aria-label`s reflect the active icon's purpose accurately (e.g., `aria-label="clear search"`).
