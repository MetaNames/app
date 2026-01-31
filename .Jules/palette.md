## 2024-10-27 - Improving Dynamic Content Accessibility
**Learning:** Dynamic content updates, like changing the "years" value in a payment calculator, are often invisible to screen readers.
**Action:** Use `aria-live="polite"` and `aria-atomic="true"` on the container element to ensure the updated value is announced when it changes.
