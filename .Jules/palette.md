## 2024-10-24 - Mismatched ARIA References in Dialogs

**Learning:** Found a pattern where `aria-labelledby` and `aria-describedby` in Dialog components did not match the actual `id`s of the `Title` and `Content` elements. This breaks accessibility for screen readers as they cannot associate the title/description with the dialog.
**Action:** When using `Dialog` or similar components with ARIA references, always double-check that the `id` attributes on the referenced elements match exactly.
