## 2024-10-24 - Loading Indicators Accessibility

**Learning:** Visual loading indicators (e.g., `CircularProgress`) usually lack semantic meaning for screen readers. They must include an `aria-label` attribute to provide context to assistive technologies.
**Action:** Always add `aria-label="Loading..."` (or more specific context) to any `CircularProgress` or spinner component.
