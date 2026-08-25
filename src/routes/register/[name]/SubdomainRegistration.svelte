<script lang="ts">
	import type { Domain as DomainModel } from '@metanames/sdk';

	import { goto } from '$app/navigation';
	import { alertMessage, walletAddress } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { loadOrReport } from '$lib/read';
	import { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import { onMount } from 'svelte';

	import { runTransaction } from '$lib/transaction';
	import Chip from 'src/components/Chip.svelte';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';

	export let domainName: string;
	export let parentDomainName: string;

	let parentDomain: DomainModel | null;

	$: parentLink = `/domain/${parentDomainName}`;

	onMount(async () => {
		const found = await loadOrReport(
			$metaNamesSdk.domainRepository.find(parentDomainName),
			'Could not load the parent domain. Please try again.'
		);
		// Only a confirmed absence (`null`) should bounce to the parent's registration page. On
		// `undefined` the lookup failed and we do not know either way, so stay put.
		if (found === undefined) return;

		parentDomain = found;
		if (!parentDomain) goto(`/register/${parentDomainName}`);
	});

	async function registerDomain() {
		const address = $walletAddress;
		if (!address) return;

		const transactionIntent = await $metaNamesSdk.domainRepository.register({
			domain: domainName,
			parentDomain: parentDomainName,
			to: address,
			byocSymbol: 'TEST_COIN'
		});
		await runTransaction(transactionIntent, 'Failed to register domain.');
		alertMessage.set('Domain registered successfully!');

		goto(`/domain/${domainName}`);
	}
</script>

<Card class="domain-container">
	<Content>
		<div class="card-content">
			<h2 class="domain-title type-headline4">{domainName}</h2>

			<div class="content">
				<Chip class="flex mt-2" label="Parent" value={parentDomainName} href={parentLink} />
			</div>

			<div class="fees">
				<p class="title text-center">Price breakdown</p>
				<div class="row">
					<span>Total (excluding network fees)</span>
					<span><b>FREE</b></span>
				</div>
			</div>

			<div class="submit">
				<ConnectionRequired>
					<LoadingButton onClick={registerDomain} variant="raised">
						<Label>Register domain</Label>
					</LoadingButton>
				</ConnectionRequired>
			</div>
		</div></Content
	>
</Card>

<style lang="scss">
	.domain-title {
		margin-top: 0;
		text-align: center;

		margin-bottom: 0.5rem;
	}

	// Layout rules for the fee block live in src/styles/fees.scss, shared with
	// DomainPayment.svelte. This component adds no `.fees` extras of its own.

	.submit {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}
</style>
