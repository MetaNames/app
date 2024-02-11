<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import { alertMessage } from '$lib/stores/main';

	import CircularProgress from '@smui/circular-progress';

	import DomainRegistration from 'src/routes/register/[name]/DomainRegistration.svelte';
	import SubdomainRegistration from 'src/routes/register/[name]/SubdomainRegistration.svelte';
	import { page } from '$app/stores';
	import { metaNamesSdk } from 'src/lib/stores/sdk';
	import { writable } from 'svelte/store';

	const isDomainPresent = writable<boolean>();
	const isParentPresent = writable<boolean>();

	const paramName = $page.params.name;
	const analyzed = $metaNamesSdk.domainRepository.analyze(paramName);

	$: domainName = analyzed.name;
	$: parentDomainName = analyzed.parentId;
	$: pageName = domainName + ' | ';
	$: tld = analyzed.tld;

	onMount(async () => {
		type CheckResponse = { domainPresent: boolean; parentPresent: boolean };
		const check: CheckResponse = await fetch(`/api/domains/${domainName}/check`).then((res) =>
			res.json()
		);

		isDomainPresent.set(check.domainPresent);
		if ($isDomainPresent) return goto(`/domain/${domainName}`, { replaceState: true });

		isParentPresent.set(check.parentPresent);
		if (parentDomainName && !$isParentPresent) {
			alertMessage.set('Parent domain not found, please register it first.');
			return goto(`/register/${parentDomainName}`, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content">
	{#if $isDomainPresent === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else}
		<h2>Register</h2>
		{#if $isParentPresent && parentDomainName}
			<SubdomainRegistration {domainName} {parentDomainName} />
		{:else if parentDomainName && !$isParentPresent}
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
		margin: 1rem;

		@media screen and (max-width: 768px){
			max-width: 90vw;
			width: initial;
		}
	}
</style>
