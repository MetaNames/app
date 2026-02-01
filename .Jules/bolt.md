## 2024-10-27 - Caching and Types in Svelte
**Learning:** `NodeJS.Timeout` is not cross-platform compatible in SvelteKit (browser vs node). Use `ReturnType<typeof setTimeout>`.
**Action:** Use `ReturnType<typeof setTimeout>` for all timer variables.

## 2024-10-27 - Svelte Module Script Imports
**Learning:** Importing the same type name in both `context="module"` and instance scripts causes "Duplicate identifier" errors in `svelte-check`.
**Action:** Rename one of the imports or use a unique alias.
