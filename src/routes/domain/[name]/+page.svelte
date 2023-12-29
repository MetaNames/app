<script lang="ts">
	import { page } from '$app/stores';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import Domain from './Domain.svelte';
	import { metaNamesSdk } from '$lib/stores';

	import CircularProgress from '@smui/circular-progress';
	import Paper from '@smui/paper';
	import GoBackButton from './GoBackButton.svelte';

	let domain: DomainModel | null;

	$: pageName = domain ? domain.name + ' | ' : '';

	onMount(async () => {
		domain = await $metaNamesSdk.domainRepository.find($page.params.name);
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content domain">
	{#if domain}
		<Domain {domain} />
		<br />
		<GoBackButton />
	{:else if domain === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else if domain === null}
		<Paper class="w-100 text-center" variant="raised">
			<h3>Domain not found</h3>
			<GoBackButton />
		</Paper>
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
