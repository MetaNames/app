## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2026-05-12 - Conditional Render for Decorative Input Icons

**Learning:** Decorative or action icons within text inputs (like 'clear search' icons) must be conditionally rendered. If an empty state leaves an invisible or irrelevant icon focusable, it creates a keyboard navigation trap and confuses screen readers. Also, when filtering lists with Svelte reactive statements, an explicit 'else' branch is required to revert the list when the input becomes empty.
**Action:** Always wrap trailing/clear icons in `{#if value !== ''}` and bind structural props (like `withTrailingIcon`) to the same condition. Ensure filtering reactive statements include fallback logic for empty states.
