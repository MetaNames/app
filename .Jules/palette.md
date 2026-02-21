## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2026-02-21 - Immediate Feedback in Typeahead Search

**Learning:** When using debounced search-as-you-type, users may not notice distant loading indicators. Replacing the search icon *inside* the input with a spinner provides immediate, localized confirmation that their input is being processed.
**Action:** Use a `CircularProgress` or spinner in the `trailingIcon` slot of inputs during async operations, maintaining the same dimensions (e.g., 48x48px) to prevent layout shifts.
