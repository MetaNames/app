## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-24 - Trailing Clear Icon for Textfield

**Learning:** When adding a clear icon to an SMUI `Textfield` component to allow users to quickly reset debounced search input, conditionally rendering the inner `IconButton` based on whether the input string is empty (e.g. `{#if domainName !== ''}`) is insufficient because the outer `.mdc-text-field--with-trailing-icon` styling continues to reserve space and focusability for a now empty node.
**Action:** Always dynamically bind the outer Svelte `withTrailingIcon` attribute directly to the emptiness condition (e.g. `withTrailingIcon={domainName !== ''}`) when conditionally rendering trailing icons inside the `Textfield` component to properly update its state and styling.
