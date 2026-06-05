## 2024-10-24 - Accessible Icon Props and Loading Button State
**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2024-10-25 - ARIA Attributes for Interactive Trigger Elements

**Learning:** When using buttons as interactive trigger elements (like opening a menu or dropdown), it's crucial for accessibility to inform screen reader users about the button's behavior and current state. Missing these attributes can leave keyboard and screen reader users confused about what the button does or whether their action was successful.
**Action:** Always add `aria-haspopup="menu"` (or the appropriate role, such as `listbox` or `dialog`) and bind `aria-expanded` to the component's open state variable for buttons that trigger popups or menus.
