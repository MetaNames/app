## 2024-05-18 - Search Input Affordance
**Learning:** Having a persistent "cancel" icon in search inputs when they are empty creates false affordances and confuses screen readers when labeled improperly.
**Action:** Replace the cancel icon with a disabled "search" icon on empty state, and only show the cancel icon (with aria-label="clear search") when text is present.
