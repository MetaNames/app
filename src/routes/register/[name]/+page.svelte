<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import { metaNamesSdk } from '$lib/stores';

	import type { Domain as DomainModel } from '@metanames/sdk';

	import CircularProgress from '@smui/circular-progress';

	import DomainRegistration from './DomainRegistration.svelte';

	let domain: DomainModel | null;

	const nameParam = $page.params.name;

	const analyzedDomain = $metaNamesSdk.domainRepository.analyze(nameParam);

	$: domainName = analyzedDomain.name;
	$: pageName = domain ? domain.name + ' | ' : '';
	$: tld = analyzedDomain.tld;

	onMount(async () => {
		domain = await $metaNamesSdk.domainRepository.find(domainName);

		if (domain) goto(`/domain/${domain.name}`);
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content">
	{#if !domain}
		<div class="container">
			<h2>Register</h2>
			<DomainRegistration {domainName} {tld} />
		</div>
	{:else if domain === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{/if}
</div>

<style lang="scss">
	h2 {
		margin-top: 0;
		text-align: center;
	}

	.content {
		max-width: 48rem;
		width: 100%;
	}
</style>
