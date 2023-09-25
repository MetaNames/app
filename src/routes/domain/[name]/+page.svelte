<script lang="ts">
	import { page } from '$app/stores';
	import { metaNamesSdk } from '$lib';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import Domain from './Domain.svelte';

	import CircularProgress from '@smui/circular-progress';

	let domain: DomainModel | null;

	$: pageName = domain ? domain.name + ' | ' : '';

	onMount(async () => {
		domain = await metaNamesSdk.domainRepository.find($page.params.name);
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content domain">
	{#if domain}
		<Domain {domain} />
	{:else if domain === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else if domain === null}
		<p>Domain not found</p>
		<a href="/">Go back</a>
	{/if}
</div>

<style lang="scss">
	.domain {
		min-width: 60vw;
	}

	@media (max-width: 768px) {
		.domain {
			min-width: 90vw;
		}
	}
</style>
