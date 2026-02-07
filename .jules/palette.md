## 2024-10-27 - Search Input Accessibility
**Learning:** The `@smui/textfield` component relies on `on:keyup` in existing patterns, which misses non-keyboard inputs like paste. Using `on:input` is more robust. Also, `@smui/circular-progress` lacks default accessibility labels.
**Action:** When implementing search or text inputs, prefer `on:input`. Always add `aria-label` to loading indicators.
