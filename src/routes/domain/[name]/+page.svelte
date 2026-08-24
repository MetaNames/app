<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { refresh } from '$lib/stores/main';

	import type { PageData } from './$types';

	export let data: PageData;

	// Reactive, not captured once: SvelteKit reuses this component when only `[name]` changes.
	$: domain = data.domain;
	// The URL `load` fetched, which is what SvelteKit tracked as this page's dependency. Read from
	// the params rather than from `domain.name`, which the SDK stores label-reversed.
	$: domainApiUrl = `/api/domains/${$page.params.name}`;

	onMount(() =>
		refresh.subscribe((val) => {
			if (!val) return;

			// Re-runs `load`, so the record edit that asked for this shows up without a second
			// read path living in this component. `domainApiUrl` is read at call time, so a
			// refresh after an in-place navigation invalidates the domain now on screen.
			invalidate(domainApiUrl);
			refresh.set(false);
		})
	);
</script>

<svelte:head>
	<title>{domain.name} | Meta Names</title>
</svelte:head>

<div class="content domain">
	<Domain {domain} />
	<br />
	<GoBackButton />
</div>

<style lang="scss">
	.domain {
		width: 100%;
		max-width: 48rem;
		margin: 2rem 1rem;
		// The card is server-rendered now, so there is no spinner branch to swap out of and the two
		// shifts below cannot recur through that route. The floor stays as a guard: `.content` is
		// `flex-grow: 1`, so a short first paint would be stretched to the leftover viewport —
		// 603px at 390x844, 495px at 1280x720 — and the footer would sit under that until the card's
		// 695.14px landed, shoving it down 92px / 200px. 44rem is the smallest whole rem clearing it.
		min-height: 44rem;
	}

	@media screen and (max-width: 768px) {
		.domain {
			// And `width: 100%` above is load-bearing: `.content` is `align-self: center`, so it is
			// shrink-to-fit, and `width: initial` here used to drop it — sizing an empty box to its
			// 32px spinner and the loaded one to the 351px card. That 32px→351px growth was 0.1419 of
			// this route's 0.1425 CLS, and it is why the plan's height-only fix (32rem, erratum E9)
			// could not have worked. Overriding only `max-width` pins the box to a single width.
			max-width: 90vw;
		}
	}
</style>
