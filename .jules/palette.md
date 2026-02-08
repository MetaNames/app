## 2024-10-24 - Search Input Interaction and Accessibility
**Learning:** Reliance on `on:keyup` for search inputs fails to capture events like pasting or drag-and-drop, leading to missed user intent. `on:input` is the comprehensive solution. Additionally, visual loading spinners (like `CircularProgress`) are invisible to screen readers without an explicit `aria-label`.
**Action:** Always prefer `on:input` for text fields and ensure every loading state has a corresponding `aria-label` or `aria-live` region.
