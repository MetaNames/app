<script lang="ts">
	import { alertTransactionAndFetchResult, bridgeUrl, getAccountBalance } from '$lib';
	import { alertMessage, walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk, selectedCoin } from '$lib/stores/sdk';
	import type { BYOC } from '@metanames/sdk';
	import { InsufficientBalanceError } from 'src/lib/error';
	import { writable } from 'svelte/store';

	import { Label } from '@smui/button';
	import Icon from 'src/components/Icon.svelte';
	import Card, { Content } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import IconButton from '@smui/icon-button';
	import Select, { Option } from '@smui/select';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';
	import type { DomainFeesResponse, DomainPaymentParams } from 'src/lib/types';
	import { fetchApiJson } from 'src/lib/api';

	export let domainName: string;
	export let tld: string;
	export let payment: (params: DomainPaymentParams) => Promise<void>;
	export let paymentLabel: string;

	let years = 1;
	let feesApproved = false;
	let availableCoins: BYOC[] = $metaNamesSdk.config.byoc;

	$: nameWithoutTLD = domainName.endsWith(`.${tld}`)
		? domainName.replace(`.${tld}`, '')
		: domainName;
	$: charsLabel = nameWithoutTLD.length > 1 ? 'chars' : 'char';
	$: loadFees = fetchApiJson<DomainFeesResponse>(
		`/api/register/${domainName}/fees/${$selectedCoin}`
	);
	$: nameLength = nameWithoutTLD.length > 6 ? '6+' : nameWithoutTLD.length;
	$: yearsLabel = years === 1 ? 'year' : 'years';

	const totalFees = writable(0);

	const totalFeesLabel = (label: number, years: number) => {
		const total = label * years;
		totalFees.set(total);

		return Math.ceil(total * 10000) / 10000;
	};

	function addYears(amount: number) {
		if (years + amount < 1) return;

		years += amount;
	}

	async function handleApproveError(error: Error) {
		let message;
		if (error instanceof InsufficientBalanceError)
			message = {
				message: `Insufficient balance for ${error.coin}`,
				action: {
					label: 'Add funds',
					callback: () => window.open(bridgeUrl, '_blank')
				}
			};
		else if (error && error instanceof Error) message = error.message;
		else message = 'Something went wrong';

		alertMessage.set(message);
	}

	async function approveFees() {
		if (!$walletConnected) return;

		const address = $walletAddress as string;
		const account = await getAccountBalance(address);
		const accountCoin = account.account.displayCoins.find((coin) => coin.symbol === $selectedCoin);
		if (!accountCoin || Number(accountCoin.balance) < $totalFees)
			throw new InsufficientBalanceError($selectedCoin);

		const transactionIntent = await $metaNamesSdk.domainRepository.approveMintFees(
			domainName,
			$selectedCoin,
			years
		);
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) throw new Error('Failed to approve mint fees.');
		else feesApproved = true;
	}

	async function pay() {
		const address = $walletAddress;
		if (!address) return;

		if (!feesApproved) throw new Error('Fees not approved');

		await payment({ domainName, address, byocSymbol: $selectedCoin, years });
	}
</script>

<Card class="domain-container">
	<Content>
		<div class="card-content">
			<h4>{domainName}</h4>

			<div class="years">
				<IconButton
					on:click={() => addYears(-1)}
					disabled={years === 1 || feesApproved}
					aria-label="remove-year"
				>
					<Icon icon="remove" />
				</IconButton>
				<span>{years} {yearsLabel}</span>
				<IconButton on:click={() => addYears(1)} disabled={feesApproved} aria-label="add-year">
					<Icon icon="add" />
				</IconButton>
			</div>

			<div class="coin">
				<p class="title text-center">Payment token</p>
				<div class="row centered">
					<Select bind:value={$selectedCoin} label="Select Token" variant="outlined">
						{#each availableCoins as coin}
							<Option value={coin.symbol}>{coin.symbol}</Option>
						{/each}
					</Select>
				</div>
			</div>
			<div class="fees">
				<p class="title text-center">Price breakdown</p>
				{#await loadFees}
					<CircularProgress style="height: 32px; width: 32px;" indeterminate />
				{:then fees}
					{#if 'symbol' in fees}
						<div class="row">
							<span>1 year registration for <b>{nameLength} {charsLabel}</b></span>
							<span>{fees.feesLabel} {fees.symbol}</span>
						</div>
						<div class="row" data-testid="total-fees">
							<span>Total (excluding network fees)</span>
							<span><b>{totalFeesLabel(fees.feesLabel, years)}</b> {fees.symbol}</span>
						</div>
					{/if}
				{/await}
			</div>

			<ConnectionRequired class="mt-1">
				<div class="submit">
					<LoadingButton
						disabled={feesApproved}
						onClick={approveFees}
						onError={handleApproveError}
						variant="raised"
					>
						<Label>Approve fees</Label>
					</LoadingButton>
				</div>
				<div class="submit mt-1">
					<LoadingButton disabled={!feesApproved} onClick={pay} variant="raised">
						<Label>{paymentLabel}</Label>
					</LoadingButton>
				</div>
			</ConnectionRequired>
		</div>
	</Content>
</Card>

<style lang="scss">
	h4 {
		margin-top: 0;
		text-align: center;
	}

	.centered {
		flex-direction: column !important;
		align-items: center;
	}

	.fees,
	.coin {
		display: flex;
		flex-direction: column;
		align-items: center;

		margin-top: 1rem;
		padding: 0 5rem;

		.title {
			font-weight: bold;
		}

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

			.title {
				margin-bottom: 0;
			}
		}
	}

	.submit {
		display: flex;
		justify-content: center;
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
