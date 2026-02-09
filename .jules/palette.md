## 2024-10-24 - Async Button State Accessibility
**Learning:** Async buttons with visual-only state changes (spinner, icons) are inaccessible to screen readers without explicit `aria-live` announcements. Success states that persist indefinitely can be confusing and block retry actions.
**Action:** Always include a visually hidden `span` with `role="status"` and `aria-live="polite"` to announce state changes ("Loading", "Success", "Error"). Implement auto-reset for success states on buttons.
