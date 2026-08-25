<script lang="ts">
	import { browser } from '$app/environment';
	import { bridgeUrl, getAccountBalance } from '$lib';
	import { runTransaction } from '$lib/transaction';
	import { alertMessage, walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk, selectedCoin } from '$lib/stores/sdk';
	import type { BYOC } from '@metanames/sdk';
	import { InsufficientBalanceError } from '$lib/error';
	import {
		assertSufficientBalance,
		computeTotalFees,
		formatTotalFees,
		isStaleFeeResponse
	} from '$lib/payment-fees';

	import Button, { Label } from '@smui/button';
	import Icon from 'src/components/Icon.svelte';
	import Card, { Content } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import IconButton from '@smui/icon-button';
	import Select, { Option } from '@smui/select';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';
	import type { ApiError, DomainFeesResponse, DomainPaymentParams } from '$lib/types';
	import { fetchApiJson } from '$lib/api';

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

	// Bumped by Retry. Together with $selectedCoin it identifies the newest fee
	// request; responses from older generations/coins are dropped as stale.
	let feesGeneration = 0;

	let loadFees: Promise<DomainFeesResponse | ApiError | null>;
	let fees: DomainFeesResponse | ApiError | null = null;
	let feesError = false;

	function reloadFees() {
		feesError = false;
		feesGeneration += 1;
	}

	// Re-runs on Retry (generation bump) and coin switches. The generation/coin
	// pair captured before .then guards against a slow older request resolving
	// after a newer one and overwriting fresher state with the wrong coin's
	// fees. `fees` is dropped up front so no stale total stays visible — or
	// approvable via approveFees() — while a reload is in flight.
	$: {
		const generation = feesGeneration;
		const coin = $selectedCoin;
		fees = null;
		loadFees = browser
			? fetchApiJson<DomainFeesResponse>(`/api/register/${domainName}/fees/${coin}`).then(
					(result) => {
						if (isStaleFeeResponse(generation, feesGeneration, coin, $selectedCoin)) return null;
						fees = result;
						feesError = false;
						return result;
					},
					() => {
						if (isStaleFeeResponse(generation, feesGeneration, coin, $selectedCoin)) return null;
						feesError = true;
						return null;
					}
				)
			: Promise.resolve(null);
	}

	$: nameLength = nameWithoutTLD.length > 6 ? '6+' : nameWithoutTLD.length;
	$: yearsLabel = years === 1 ? 'year' : 'years';

	// Pure derivation — no store writes during render.
	$: totalFees = fees && 'symbol' in fees ? computeTotalFees(fees.feesLabel, years) : 0;

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
					callback: () => window.open(bridgeUrl, '_blank', 'noopener,noreferrer')
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
		assertSufficientBalance(accountCoin ? accountCoin.balance : 0, totalFees, $selectedCoin);

		const transactionIntent = await $metaNamesSdk.domainRepository.approveMintFees(
			domainName,
			$selectedCoin,
			years
		);
		await runTransaction(transactionIntent, 'Failed to approve mint fees.');
		feesApproved = true;
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
			<h2 class="type-headline4">{domainName}</h2>

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

			<div class="coin" data-testid="payment-token-section">
				<p class="title text-center" data-testid="payment-token-label">Payment token</p>
				<div class="row centered">
					<Select
						bind:value={$selectedCoin}
						label="Select Token"
						variant="outlined"
						anchor$aria-label="Select Token"
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
				{:then result}
					<!-- Same error + Retry markup as {:catch}; kept inline because Svelte 4 has no snippets. -->
					{#if feesError || (result && 'error' in result)}
						<p class="fees-error" data-testid="fees-error" role="alert">
							Could not load the fee breakdown. Check your connection and try again.
						</p>
						<Button
							class="retry-button"
							variant="raised"
							data-testid="retry-fees"
							on:click={reloadFees}
						>
							<Label>Retry</Label>
						</Button>
					{:else if result === null}
						<p class="fees-error" data-testid="fees-unavailable" role="alert">
							Fees are not available yet.
						</p>
					{:else if !('error' in result) && 'symbol' in result}
						<div class="row">
							<span>1 year registration for <b>{nameLength} {charsLabel}</b></span>
							<span>{result.feesLabel} {result.symbol}</span>
						</div>
						<div class="row" data-testid="total-fees">
							<span>Total (excluding network fees)</span>
							<span><b>{formatTotalFees(totalFees)}</b> {result.symbol}</span>
						</div>
					{/if}
				{:catch}
					<!-- Duplicated error + Retry block: Svelte 4 has no {#snippet}, and an
						inline component would need every prop threaded through. -->
					<p class="fees-error" data-testid="fees-error" role="alert">
						Could not load the fee breakdown. Check your connection and try again.
					</p>
					<Button
						class="retry-button"
						variant="raised"
						data-testid="retry-fees"
						on:click={reloadFees}
					>
						<Label>Retry</Label>
					</Button>
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
	h2 {
		margin-top: 0;
		text-align: center;
		// A domain name is one unbreakable word, and it is the only thing on this card that
		// overflowed. Left to wrap normally, zzunregistered123.mpc lays out 359px of text in a
		// 256px box and takes the document to 391px of scroll width at 320px — identically on
		// /register and /renew, since both feed this heading the name from the URL. Longer names
		// are worse; test.mpc happens to be short enough to fit either way.
		overflow-wrap: anywhere;
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
		// Legibility, not reflow: reverting this to `0 5rem` moves scroll width by 0px at every
		// width — the h4 above was what overflowed. What 5rem cost was content. 160px of
		// padding left the fee rows 96px of a 320px viewport; scaling it with the viewport
		// gives them 179px. 12vw reaches 80px at 667px, so from there up the padding — and the
		// desktop layout — is byte-identical to what it was.
		padding: 0 clamp(0.5rem, 12vw, 5rem);

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

	.fees .fees-error {
		margin: 1rem 0 0;
		text-align: center;
		color: var(--mdc-theme-error, #b00020);
	}

	.fees :global(.retry-button) {
		margin-top: 0.75rem;
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
