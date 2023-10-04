<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	import { getSDK } from '$lib';
	import { walletAddress, walletConnected } from '$lib/stores';

	import type { Domain as DomainModel } from '@metanames/sdk';

	import Button, { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import IconButton from '@smui/icon-button';

	let domain: DomainModel | null;

	const nameParam = $page.params.name;

	let years = 1;
	let feesApproved = false;

	$: domainName = nameParam.endsWith('.meta') ? nameParam : `${nameParam}.meta`;
	$: charsLabel = nameParam.length > 1 ? 'chars' : 'char';
	$: fees = getSDK().domainRepository.calculateMintFees(nameParam);
	$: nameLength = nameParam.length > 5 ? '5+' : nameParam.length;
	$: pageName = domain ? domain.name + ' | ' : '';
	$: totalFeesAmount = fees.amount * years;
	$: yearsLabel = years === 1 ? 'year' : 'years';

	function addYears(amount: number) {
		if (years + amount < 1) return;

		years += amount;
	}

	onMount(async () => {
		domain = await getSDK().domainRepository.find(domainName);

		if (domain) goto(`/domain/${domain.name}`);
	});

	async function approveFees() {
		if (!$walletConnected) return;

		const { hasError, trxHash: approveTrx } = await getSDK().domainRepository.approveMintFees(
			domainName,
			years
		);
		if (hasError) throw new Error(`Failed to approve mint fees. Transaction: ${approveTrx}`);
		else feesApproved = true;
	}

	async function registerDomain() {
		const address = $walletAddress;
		if (!address) return;

		if (!feesApproved) throw new Error('Fees not approved');

		const { hasError: registerHasError, trxHash: registerTrx } =
			await getSDK().domainRepository.register({
				domain: domainName,
				to: address
			});
		if (registerHasError) throw new Error(`Failed to register domain. Transaction: ${registerTrx}`);

		goto(`/domain/${domainName}`);
	}
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content">
	{#if !domain}
		<div class="container">
			<h2>Register</h2>
			<Card>
				<Content>
					<div class="card-content">
						<h4>{domainName}</h4>

						<div class="years">
							<IconButton class="material-icons" on:click={() => addYears(-1)} disabled={years == 1}
								>remove</IconButton
							>
							<span>{years} {yearsLabel}</span>
							<IconButton class="material-icons" on:click={() => addYears(1)}>add</IconButton>
						</div>

						<div class="fees">
							<p class="text-center">Price breakdown</p>
							<div class="row">
								<span>1 year registration for <b>{nameLength} {charsLabel}</b></span>
								<span>{fees.amount} {fees.token}</span>
							</div>
							<div class="row">
								<span>Total (excluding network fees)</span>
								<span><b>{totalFeesAmount}</b> {fees.token}</span>
							</div>
						</div>

						<div class="submit">
							{#if !feesApproved}
								<Button disabled={!$walletConnected} on:click={approveFees} variant="raised">
									<Label>Approve fees</Label>
								</Button>
							{:else}
								<Button disabled={!$walletConnected} on:click={registerDomain} variant="raised">
									<Label>Register domain</Label>
								</Button>
							{/if}
						</div>
					</div></Content
				>
			</Card>
		</div>
	{:else if domain === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{/if}
</div>

<style lang="scss">
	h2,
	h4 {
		margin-top: 0;
		text-align: center;
	}

	.content {
		max-width: 48rem;
		width: 100%;
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

	.years {
		display: flex;
		justify-content: space-evenly;
		align-items: center;

		span {
			font-size: xx-large;
		}
	}
</style>
