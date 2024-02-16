<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { alertMessage } from '$lib/stores/main';
	import { fetchApiJson } from 'src/lib/api';
	import { metaNamesSdk } from 'src/lib/stores/sdk';
	import type { DomainCheckResponse, DomainPaymentParams } from 'src/lib/types';
	import { writable } from 'svelte/store';

	import type { IDomainAnalyzed } from '@metanames/sdk';
	import CircularProgress from '@smui/circular-progress';
	import SubdomainRegistration from 'src/routes/register/[name]/SubdomainRegistration.svelte';
	import { onMount } from 'svelte';
	import DomainPayment from 'src/components/DomainPayment.svelte';
	import { alertTransactionAndFetchResult } from 'src/lib';
	import { track } from '@vercel/analytics/*';

	const isDomainPresent = writable<boolean>();
	const isParentPresent = writable<boolean>();

	const paramName = $page.params.name;
	const analyzed = writable<IDomainAnalyzed>();

	$: domainName = $analyzed?.name;
	$: parentDomainName = $analyzed?.parentId;
	$: pageName = domainName + ' | ';
	$: tld = $analyzed.tld;

	async function payment(params: DomainPaymentParams) {
		const transactionIntent = await $metaNamesSdk.domainRepository.register({
			domain: params.domainName,
			to: params.address,
			subscriptionYears: params.years,
			byocSymbol: params.byocSymbol,
			tokenUri: params.domainName
		});

		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) throw new Error('Failed to register domain.');
		else alertMessage.set('Domain registered successfully!');

		track('domain_registered', {
			domain: domainName,
			years: params.years,
			byoc: params.byocSymbol
		});

		goto(`/domain/${domainName}`);
	}

	onMount(async () => {
		try {
			const domain = $metaNamesSdk.domainRepository.analyze(paramName);
			analyzed.set(domain);
		} catch (e) {
			console.error(e);

			let message = 'Domain not valid';
			if (e instanceof Error) message = e.message;
			alertMessage.set(message);

			goto(`/`, { replaceState: true });
		}

		const check = await fetchApiJson<DomainCheckResponse>(`/api/domains/${paramName}/check`);

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
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content checkout">
	{#if $isDomainPresent === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else}
		<h2 class="mt-0">Register</h2>
		{#if $isParentPresent && parentDomainName}
			<SubdomainRegistration {domainName} {parentDomainName} />
		{:else}
			<DomainPayment
				{domainName}
				{tld}
				paymentLabel="Register domain"
				{payment}
				/>
		{/if}
	{/if}
</div>
