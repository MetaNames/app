## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.
## 2024-11-20 - Unnecessary Clear Icons and Form Focus Accessibility
**Learning:** Having a "clear" trailing icon on a text input is redundant and can distract keyboard navigation (adding unnecessary tab stops) when the input is empty. Additionally, trailing icons generated via Svelte fragments should use conditional rendering (`{#if condition}`) paired with dynamic component properties (e.g., `withTrailingIcon={condition}`) to fully remove them from the DOM and layout when inactive.
**Action:** When adding or maintaining a clear/reset action in textfields, always conditionally render the button (and update the layout wrapper property) based on the input not being empty, and ensure the button has a descriptive `aria-label` like "clear search" rather than a generic "cancel".
