## 2024-10-24 - Accessible Icon Props and Loading Button State

**Learning:** Svelte wrapper components (like `Icon.svelte`) must spread `$$restProps` to allow passing accessibility attributes (e.g., `aria-label`) from parent components. Without this, icons remain inaccessible to screen readers. Also, persistent "Success" states on buttons can be confusing; auto-resetting them after a timeout improves clarity.
**Action:** Always include `{...$$restProps}` in wrapper components and implement auto-reset logic for temporary success states in interactive elements.

## 2025-03-12 - Deterministic Unique IDs for Dialog Accessibility

**Learning:** When using @smui/dialog or similar accessible modal components, especially when rendered in a loop or multiple times on a page (like per-record operations), `aria-labelledby` and `aria-describedby` must point to uniquely generated IDs. Using static IDs like `simple-title` causes screen readers to misidentify modal contexts or read out the wrong accessible names.
**Action:** Always map generic IDs in reusable accessible components (like `id="simple-title"`) to deterministic, unique values (e.g., `id="confirmation-title-{label}"`) based on specific component props.
