<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import CircularProgress from '@smui/circular-progress';
	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { writable } from 'svelte/store';
	import { alertMessage, refresh } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';

	let domain = writable<DomainModel | undefined>();
	let requestId = 0;
	let mounted = false;

	// SvelteKit reuses this component when only `[name]` changes, so the name has to be read
	// reactively — a value captured once goes stale on the very redirect below.
	$: domainName = $page.params.name ?? '';
	$: pageName = $domain ? $domain.name + ' | ' : '';
	// Gated on `mounted` rather than `browser` so the first run still happens after mount, as
	// it did before, and never calls `goto` mid-hydration.
	$: if (mounted) showDomain(domainName);

	onMount(() => {
		mounted = true;

		return refresh.subscribe((val) => {
			if (!val) return;

			loadDomain(domainName);
			refresh.set(false);
		});
	});

	async function showDomain(name: string) {
		const loweredName = name.toLocaleLowerCase();
		// The redirect re-runs this with the normalised param; loading the un-normalised name
		// here would race that second pass and could resolve to "not found".
		if (loweredName !== name) return goto(`/domain/${loweredName}`, { replaceState: true });

		await loadDomain(name);
	}

	async function loadDomain(name: string) {
		const currentRequestId = ++requestId;
		domain.set(undefined);

		const domainResponse = await $metaNamesSdk.domainRepository.find(name);
		if (currentRequestId !== requestId) return;

		if (domainResponse) domain.set(domainResponse);
		else {
			alertMessage.set('Domain not found. Register it now!');
			goto(`/register/${name}`, { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content domain">
	{#if !$domain}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else if $domain}
		<Domain domain={$domain} />
		<br />
		<GoBackButton />
	{/if}
</div>

<style lang="scss">
	.domain {
		width: 100%;
		max-width: 48rem;
		margin: 2rem 1rem;
	}

	@media screen and (max-width: 768px) {
		.domain {
			width: initial;
			max-width: 90vw;
		}
	}
</style>
