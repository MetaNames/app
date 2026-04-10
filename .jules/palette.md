## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2026-04-10 - Contextual Search Icons
**Learning:** When implementing search inputs, use contextual icons (e.g., a disabled 'search' magnifying glass when empty, and an enabled 'clear' icon when text is present) rather than a persistent 'cancel' icon to prevent false affordances. Ensure `aria-label`s reflect the active icon's purpose.
**Action:** Always conditionally render search input icons based on the input's state and verify ARIA labels match the current icon's function.
