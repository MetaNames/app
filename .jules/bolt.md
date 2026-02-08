## 2024-10-27 - Svelte Keyed Loops
**Learning:** Svelte `{#each}` loops iterating over dynamic keys (e.g. `Object.keys`) without a keyed identifier can lead to inefficient DOM updates and state corruption in child components.
**Action:** Always verify `{#each}` loops use a unique key, especially when rendering stateful components or when the list order/content changes frequently.
