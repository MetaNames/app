## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2024-04-11 - Search Input Icon Affordance
**Learning:** In the profile search component, displaying a persistent "cancel" (clear) icon when the input is empty creates a false affordance.
**Action:** Replaced the persistent clear icon with a contextual one: it displays a disabled search magnifying glass when empty, and an interactive "clear search" icon when text is present. Added proper `aria-label`s to both.
