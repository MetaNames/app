## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-25 - ARIA Attributes for Interactive SMUI Trigger Elements
**Learning:** When using SMUI components like `<Button>` to trigger a dropdown or menu (like the Wallet Connect button), you must manually add `aria-haspopup="menu"` and bind `aria-expanded` to the component's open state variable to ensure proper keyboard and screen reader accessibility.
**Action:** Always verify that interactive trigger elements for menus/dropdowns have correct ARIA roles and state attributes.
