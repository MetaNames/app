## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-25 - Trailing Icons Accessibility & Conditional Rendering

**Learning:** When using trailing icons (e.g. for a "clear search" button) within Textfield components, rendering the icon unconditionally even when the input is empty causes it to be focusable and confusing to screen readers, especially if it performs no action.
**Action:** Conditionally render the trailing icon block and dynamically bind `withTrailingIcon` to the same condition (e.g. `search !== ''`), ensuring keyboard accessibility and proper alignment. Furthermore, update `aria-label` to be descriptive (e.g. "clear search" instead of "cancel").
