## 2024-10-24 - Persisting Error State in Async Buttons

**Learning:** Async buttons that handle errors often fail to reset their error state on subsequent attempts. This leads to a confusing UX where a successful retry still displays the error icon, making the user believe the action failed again.
**Action:** Always ensure that error flags (e.g., `hasError`) are reset at the _start_ of the async operation, not just set in the `catch` block.

## 2024-10-25 - Preventing Layout Shifts with Async Loading Indicators

**Learning:** When replacing an icon (like a search button) with a loading spinner during an async operation, explicit sizing is crucial. If the spinner is smaller than the button (e.g., 24px vs 48px), the layout will shift, causing a janky experience.
**Action:** Always wrap the loading indicator in a container that matches the exact dimensions (width/height/padding) of the element it replaces.
