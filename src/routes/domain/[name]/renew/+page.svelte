<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { alertMessage } from 'src/lib/stores/main';
	import DomainPayment from 'src/components/DomainPayment.svelte';
	import type { DomainPaymentParams } from 'src/lib/types';
	import { metaNamesSdk } from 'src/lib/stores/sdk';
	import { alertTransactionAndFetchResult } from 'src/lib';
	import { track } from '@vercel/analytics';
	import { onMount } from 'svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';

	export let data: PageData;

	async function payment(params: DomainPaymentParams) {
		const transactionIntent = await $metaNamesSdk.domainRepository.renew({
			domain: params.domainName,
			payer: params.address,
			byocSymbol: params.byocSymbol,
			subscriptionYears: params.years
		});

		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) throw new Error('Failed to renew domain.');
		else alertMessage.set('Domain renewed successfully!');

		track('domain_renewed', {
			domain: params.domainName,
			years: params.years,
			byoc: params.byocSymbol
		});

		return goto(`/domain/${params.domainName}`);
	}

	onMount(async () => {
		if ('error' in data) {
			alertMessage.set(data.error);
			return goto('/', { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Renew {data.analyzed?.name} | Meta Names</title>
</svelte:head>

<div class="content checkout">
	{#if data.analyzed}
		<h2 class="mt-0">Renew domain</h2>
		<DomainPayment
			domainName={data.analyzed.name}
			tld={data.analyzed.tld}
			paymentLabel="Renew domain"
			{payment}
		/>
		<br />
		<GoBackButton />
	{/if}
</div>
