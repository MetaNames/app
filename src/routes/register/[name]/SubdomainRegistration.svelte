<script lang="ts">
	import type { Domain as DomainModel } from '@metanames/sdk';

	import { goto } from '$app/navigation';
	import { alertMessage, walletAddress } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import { onMount } from 'svelte';

	import { alertTransactionAndFetchResult } from '$lib';
	import Chip from 'src/components/Chip.svelte';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';

	export let domainName: string;
	export let parentDomainName: string;

	let parentDomain: DomainModel | null;

	$: parentLink = `/domain/${parentDomainName}`;

	onMount(async () => {
		parentDomain = await $metaNamesSdk.domainRepository.find(parentDomainName);

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
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);

		if (hasError) throw new Error('Failed to register domain.');
		else alertMessage.set('Domain registered successfully!');

		goto(`/domain/${domainName}`);
	}
</script>

<Card class="domain-container">
	<Content>
		<div class="card-content">
			<h4 class="domain-title">{domainName}</h4>

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

	.fees {
		display: flex;
		flex-direction: column;
		align-items: center;

		margin-top: 1rem;
		padding: 0 5rem;

		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
		}

		.title {
			font-weight: bold;
		}

		@media (max-width: 768px) {
			.row {
				flex-direction: column;
				align-items: center;
				padding-top: 1rem;
			}

			.title {
				margin-bottom: 0;
			}
		}
	}

	.submit {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}
</style>
