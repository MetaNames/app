<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { onLoadErrorRedirect } from '$lib';
	import { alertMessage } from '$lib/stores/main';
	import DomainPayment from 'src/components/DomainPayment.svelte';
	import type { DomainPaymentParams } from '$lib/types';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { runTransaction } from '$lib/transaction';
	import { track } from '@vercel/analytics';
	import GoBackButton from 'src/components/GoBackButton.svelte';

	export let data: PageData;

	async function payment(params: DomainPaymentParams) {
		const transactionIntent = await $metaNamesSdk.domainRepository.renew({
			domain: params.domainName,
			payer: params.address,
			byocSymbol: params.byocSymbol,
			subscriptionYears: params.years
		});

		await runTransaction(transactionIntent, 'Failed to renew domain.');
		alertMessage.set('Domain renewed successfully!');

		track('domain_renewed', {
			domain: params.domainName,
			years: params.years,
			byoc: params.byocSymbol
		});

		return goto(`/domain/${params.domainName}`);
	}

	onLoadErrorRedirect(data);
</script>

<svelte:head>
	<title>Renew {data.analyzed?.name} | Meta Names</title>
</svelte:head>

<div class="content checkout">
	{#if data.analyzed}
		<h1 class="mt-0 type-headline2">Renew domain</h1>
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
