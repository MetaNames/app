<script lang="ts">
	import { browser } from '$app/environment';
	import { alertTransactionAndFetchResult, bridgeUrl, getAccountBalance } from '$lib';
	import { alertMessage, walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import type { BYOC } from '@metanames/sdk';
	import { InsufficientBalanceError } from 'src/lib/error';

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

	interface Props {
		domainName: string;
		tld: string;
		payment: (params: DomainPaymentParams) => Promise<void>;
		paymentLabel: string;
	}

	let { domainName, tld, payment, paymentLabel }: Props = $props();

	let years = $state(1);
	let feesApproved = $state(false);
	const availableCoins: BYOC[] = $metaNamesSdk.config.byoc;
	const initialCoinSymbol = availableCoins[0].symbol;
	let localSelectedCoin = $state(initialCoinSymbol);

	let nameWithoutTLD = $derived(
		domainName.endsWith(`.${tld}`) ? domainName.replace(`.${tld}`, '') : domainName
	);
	let charsLabel = $derived(nameWithoutTLD.length > 1 ? 'chars' : 'char');
	let loadFees = $derived(
		browser
			? fetchApiJson<DomainFeesResponse>(`/api/register/${domainName}/fees/${localSelectedCoin}`)
			: Promise.resolve(null)
	);
	let nameLength = $derived(nameWithoutTLD.length > 6 ? '6+' : nameWithoutTLD.length);
	let yearsLabel = $derived(years === 1 ? 'year' : 'years');

	const totalFeesLabel = (label: number, years: number) => {
		const total = label * years;
		return Math.ceil(total * 10000) / 10000;
	};

	function addYears(amount: number) {
		if (years + amount < 1) return;

		years += amount;
	}

	async function handleApproveError(error: unknown) {
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
		const accountCoin = account.account.displayCoins.find(
			(coin) => coin.symbol === localSelectedCoin
		);

		const fees = loadFees;
		const feesData = fees instanceof Promise ? await fees : fees;
		if (
			!accountCoin ||
			!feesData ||
			Number(accountCoin.balance) < totalFeesLabel(feesData.feesLabel, years)
		)
			throw new InsufficientBalanceError(localSelectedCoin);

		const transactionIntent = await $metaNamesSdk.domainRepository.approveMintFees(
			domainName,
			localSelectedCoin,
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

		await payment({ domainName, address, byocSymbol: localSelectedCoin, years });
	}
</script>

<Card class="domain-container">
	<Content>
		<div class="card-content">
			<h4>{domainName}</h4>

			<div class="years">
				<IconButton
					onclick={() => addYears(-1)}
					disabled={years === 1 || feesApproved}
					aria-label="remove-year"
				>
					<Icon icon="remove" />
				</IconButton>
				<span>{years} {yearsLabel}</span>
				<IconButton onclick={() => addYears(1)} disabled={feesApproved} aria-label="add-year">
					<Icon icon="add" />
				</IconButton>
			</div>

			<div class="coin" data-testid="payment-token-section">
				<p class="title text-center" data-testid="payment-token-label">Payment token</p>
				<div class="row centered">
					<Select
						bind:value={localSelectedCoin}
						label="Select Token"
						variant="outlined"
						data-testid="payment-token-select"
					>
						{#each availableCoins as coin}
							<Option value={coin.symbol}>{coin.symbol}</Option>
						{/each}
					</Select>
				</div>
			</div>
			<div class="fees" data-testid="price-breakdown-section">
				<p class="title text-center" data-testid="price-breakdown-label">Price breakdown</p>
				{#await loadFees}
					<CircularProgress style="height: 32px; width: 32px;" indeterminate />
				{:then fees}
					{#if fees && 'symbol' in fees}
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
