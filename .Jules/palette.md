## 2024-10-27 - Accessible Loading States

**Learning:** Loading indicators (spinners) often lack accessible labels, leaving screen reader users unaware of ongoing processes.
**Action:** Always add `aria-label` or `aria-labelledby` to loading components like `CircularProgress`, and consider using `aria-busy` on the container or button.
