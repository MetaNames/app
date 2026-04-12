## 2024-05-19 - Optimize O(n²) array lookups in API endpoints
**Learning:** O(n²) array lookups (`array.includes()` inside `.filter()`) can cause performance bottlenecks when iterating over large datasets, especially for API response performance.
**Action:** Always convert the lookup array into a `Set` before filtering to reduce complexity from O(n²) to O(n) for faster execution.
