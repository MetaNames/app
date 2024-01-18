<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import { alertMessage, metaNamesSdk } from '$lib/stores';

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

		if (domain) goto(`/domain/${domain.name}`, { replaceState: true });

		if (parentDomainName && parentDomainName !== tld) {
			parentDomain = await $metaNamesSdk.domainRepository.find(parentDomainName);
			if (!parentDomain) {
				alertMessage.set('Parent domain not found, please register it first.');
				goto(`/register/${parentDomainName}`, { replaceState: true });
			}
		} else parentDomain = null;
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content container">
	{#if domain === undefined || parentDomain === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else}
		<h2>Register</h2>
		{#if parentDomain && parentDomainName}
			<SubdomainRegistration {domainName} {parentDomainName} />
		{:else if parentDomainName && !parentDomain}
			<DomainRegistration domainName={parentDomainName} {tld} />
		{:else}
			<DomainRegistration {domainName} {tld} />
		{/if}
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
