<script lang="ts">
	import type { Domain as DomainModel } from '@metanames/sdk';

	import { metaNamesSdk, walletAddress, walletConnected } from '$lib/stores';
	import Card, { Content } from '@smui/card';
	import { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import LoadingButton from '../../LoadingButton.svelte';

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

<Card>
	<Content>
		<div class="card-content">
			<h4>{domainName}</h4>

			<div class="content">
				<span>Parent domain: <a href={parentLink}>{parentDomainName}</a></span>
			</div>

			<div class="fees">
				<p class="text-center">Price breakdown</p>
				<div class="row">
					<span>Total (excluding network fees)</span>
					<span><b>0</b> {fees.token}</span>
				</div>
			</div>

			<div class="submit">
				<LoadingButton disabled={!$walletConnected} onClick={registerDomain} variant="raised">
					<Label>Register subdomain</Label>
				</LoadingButton>
			</div>
		</div></Content
	>
</Card>

<style lang="scss">
	h4 {
		margin-top: 0;
		text-align: center;
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

		@media (max-width: 768px) {
			.row {
				flex-direction: column;
				align-items: center;
				padding-top: 1rem;
			}
		}
	}

	.submit {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}
</style>