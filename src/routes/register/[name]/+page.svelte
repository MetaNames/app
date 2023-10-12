<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import { metaNamesSdk } from '$lib/stores';

	import type { Domain as DomainModel } from '@metanames/sdk';

	import CircularProgress from '@smui/circular-progress';

	import DomainRegistration from './DomainRegistration.svelte';
	import SubdomainRegistration from './SubdomainRegistration.svelte';

	let domain: DomainModel | null;
	let parentDomain: DomainModel | null;

	const nameParam = $page.params.name;
	const analyzedDomain = $metaNamesSdk.domainRepository.analyze(nameParam);

	$: domainName = analyzedDomain.name;
	$: parentDomainName = analyzedDomain.parentId;
	$: pageName = domain ? domain.name + ' | ' : '';
	$: tld = analyzedDomain.tld;

	onMount(async () => {
		domain = await $metaNamesSdk.domainRepository.find(domainName);

		if (parentDomainName && parentDomainName !== tld)
			parentDomain = await $metaNamesSdk.domainRepository.find(parentDomainName);
		else parentDomain = null;

		if (domain) goto(`/domain/${domain.name}`);
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content">
	{#if domain === undefined || parentDomain === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else}
		<div class="container">
			<h2>Register</h2>
			{#if parentDomain}
				<SubdomainRegistration {domainName} {parentDomainName} />
			{:else if parentDomainName && !parentDomain}
				<!-- TODO: Add warning that parent domain does not exist -->
				<DomainRegistration domainName={parentDomainName} {tld} />
			{:else}
				<DomainRegistration {domainName} {tld} />
			{/if}
		</div>
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
