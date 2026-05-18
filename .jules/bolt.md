## 2023-12-19 - Set-based array filtering optimization

**Learning:** When filtering large arrays where the rejection condition depends on membership in another large array (e.g., `arrayA.filter(x => !arrayB.includes(x))`), this becomes an O(N * M) operation. For endpoints dealing with blockchain owners and voters, this is a significant bottleneck.
**Action:** Always pre-process the reference array into a `Set` (e.g., `const bSet = new Set(arrayB); arrayA.filter(x => !bSet.has(x))`) to reduce complexity to O(N + M). This pattern was successfully applied to `voters/add` and `voters/remove` endpoints.
