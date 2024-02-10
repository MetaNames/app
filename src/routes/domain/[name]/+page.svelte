<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { DomainTab } from '$lib/types';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import CircularProgress from '@smui/circular-progress';
	import Paper from '@smui/paper';
	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { browser } from '$app/environment';

	$: pageName = domain ? domain.name + ' | ' : '';
	$: {
		if (browser && activeDomainTab === DomainTab.settings) {
			$page.url.searchParams.set('tab', activeDomainTab.toString());
			goto(`?${$page.url.searchParams.toString()}`);
		}
	}

	let domain: DomainModel | null;
	const queryTab = $page.url.searchParams.get('tab');
	const queryDomainTab = queryTab && DomainTab[queryTab as keyof typeof DomainTab];
	let activeDomainTab = queryDomainTab || DomainTab.details;

	onMount(async () => {
		const domainName = $page.params.name;
		const loweredDomainName = domainName.toLocaleLowerCase();
		if (loweredDomainName !== domainName)
			goto(`/domain/${loweredDomainName}`, { replaceState: true });
		else domain = await $metaNamesSdk.domainRepository.find(domainName);
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content domain">
	{#if domain}
		<Domain {domain} bind:activeTab={activeDomainTab} />
		<br class="my-1" />
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
