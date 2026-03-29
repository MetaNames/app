## 2024-10-27 - TokenID Sorting Behavior
**Learning:** The `DomainsTable` component sorts all string fields using `localeCompare`, including `tokenId` which is a string in the SDK. This results in lexicographical sorting (e.g., "10" < "2") instead of numeric sorting.
**Action:** When working on sorting logic, check if string fields represent numbers and consider implementing a hybrid sort if numeric order is expected. For this task, strict behavior preservation was prioritized.
