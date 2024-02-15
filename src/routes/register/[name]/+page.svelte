<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { alertMessage } from '$lib/stores/main';
	import { fetchApiJson } from 'src/lib/api';
	import { metaNamesSdk } from 'src/lib/stores/sdk';
	import type { DomainCheckResponse } from 'src/lib/types';
	import { writable } from 'svelte/store';

	import type { IDomainAnalyzed } from '@metanames/sdk';
	import CircularProgress from '@smui/circular-progress';
	import DomainRegistration from 'src/routes/register/[name]/DomainRegistration.svelte';
	import SubdomainRegistration from 'src/routes/register/[name]/SubdomainRegistration.svelte';

	const isDomainPresent = writable<boolean>();
	const isParentPresent = writable<boolean>();

	const paramName = $page.params.name;
	const analyzed = writable<IDomainAnalyzed>();

	$: domainName = $analyzed?.name;
	$: parentDomainName = $analyzed?.parentId;
	$: pageName = domainName + ' | ';
	$: tld = $analyzed?.tld;

	async function domainCheck() {
		try {
			const domain = $metaNamesSdk.domainRepository.analyze(paramName);
			analyzed.set(domain);
		} catch (e) {
			console.error(e);

			let message = 'Domain not valid'
			if (e instanceof Error) message = e.message
			alertMessage.set(message);

			goto(`/`, { replaceState: true });
		}

		const check = await fetchApiJson<DomainCheckResponse>(`/api/domains/${domainName}/check`);

		if ('error' in check) {
			alertMessage.set(check.error);
			return goto(`/`, { replaceState: true });
		}

		isDomainPresent.set(check.domainPresent);
		if ($isDomainPresent) {
			alertMessage.set('Domain already registered.');
			return goto(`/domain/${domainName}`, { replaceState: true });
		}

		isParentPresent.set(check.parentPresent);
		if (parentDomainName && !$isParentPresent) {
			alertMessage.set('Parent domain not found, please register it first.');
			return goto(`/register/${parentDomainName}`, { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content">
	<h2>Register</h2>
	{#await domainCheck()}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:then _res}
		{#if $isParentPresent && parentDomainName}
			<SubdomainRegistration {domainName} {parentDomainName} />
		{:else if parentDomainName && !$isParentPresent}
			<DomainRegistration domainName={parentDomainName} {tld} />
		{:else}
			<DomainRegistration {domainName} {tld} />
		{/if}
	{/await}
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

		@media screen and (max-width: 768px) {
			max-width: 90vw;
			width: initial;
		}
	}
</style>
