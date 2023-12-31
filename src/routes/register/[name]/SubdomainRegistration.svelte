<script lang="ts">
	import type { Domain as DomainModel } from '@metanames/sdk';

	import { metaNamesSdk, walletAddress, walletConnected } from '$lib/stores';
	import Card, { Content } from '@smui/card';
	import { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import LoadingButton from '../../LoadingButton.svelte';
	import ConnectionRequired from './ConnectionRequired.svelte';
	import Chip from '../../../components/Chip.svelte';

	export let domainName: string;
	export let parentDomainName: string;

	let parentDomain: DomainModel | null;

	$: fees = $metaNamesSdk.domainRepository.calculateMintFees(domainName);
	$: parentLink = `/domain/${parentDomainName}`;

	onMount(async () => {
		parentDomain = await $metaNamesSdk.domainRepository.find(parentDomainName);

		if (!parentDomain) goto(`/register/${parentDomainName}`);
	});

	async function registerDomain() {
		const address = $walletAddress;
		if (!address) return;

		const { hasError: registerHasError, trxHash: registerTrx } =
			await $metaNamesSdk.domainRepository.register({
				domain: domainName,
				parentDomain: parentDomainName,
				to: address
			});
		if (registerHasError) throw new Error(`Failed to register domain. Transaction: ${registerTrx}`);

		goto(`/domain/${domainName}`);
	}
</script>

<Card class="domain-container">
	<Content>
		<div class="card-content">
			<h4 class="domain-title">{domainName}</h4>

			<div class="content">
				<Chip class="flex" iconName="supervisor_account" label="Parent">
					<a href={parentLink}>{parentDomainName}</a>
				</Chip>
			</div>

			<div class="fees">
				<p class="title text-center">Price breakdown</p>
				<div class="row">
					<span>Total (excluding network fees)</span>
					<span><b>0</b> {fees.token}</span>
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
