## 2024-10-24 - Svelte Store Lifecycle & Caching

**Learning:** In Svelte, simple local variables in components (like a `Map` or a debounce timer) persist only as long as the component is mounted. However, `Map` objects initialized outside the component instance (module-level) would be shared across all instances, which is often what we want for a cache but requires careful management. In this specific case, I initialized the `searchCache` _inside_ the component script block. Wait, let me double check my code.

I put `const searchCache = new Map<string, DomainModel | null>();` _inside_ the `<script lang="ts">` block. In Svelte, the code inside `<script>` runs when the component is instantiated. Therefore, `searchCache` is created _per component instance_. This means if the user navigates away and comes back, the cache is lost.

**Correction:** To make the cache persistent across navigations (which is the main point of caching search results in a SPA), the cache should be declared _outside_ the component or in a separate store/module.

However, `src/routes/DomainSearch.svelte` is a route component or used in one. If I want the cache to persist while the user is browsing the app, I should move the cache declaration to a module-level context or a separate file.

Let's check `src/routes/DomainSearch.svelte` again.
It has `<script lang="ts">`.
If I want it to persist, I should put it in `<script context="module">` or just import it from a shared store.
Or, simply move the declaration `const searchCache ...` to be outside the component logic? No, in `.svelte` files, code in `<script>` is per-instance.

**Action:** I need to move `searchCache` to a module context or a separate file to ensure it persists across page navigations. Otherwise, the cache is only useful if the user types, clears, and types again without leaving the component. Given the user experience "Find your Meta Name", users might search, go to a page, come back.
Actually, the current implementation is `const searchCache = ...` inside the script. This is per-instance.
If I want it global, I should use:

```svelte
<script context="module" lang="ts">
	import type { Domain as DomainModel } from '@metanames/sdk';
	const searchCache = new Map<string, DomainModel | null>();
</script>

<script lang="ts">
	// ... rest of the code
</script>
```

Let me fix this optimization to be actually effective.
