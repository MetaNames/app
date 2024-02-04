<script lang="ts">
	import { goto } from '$app/navigation';
	import { alertTransactionAndFetchResult } from '$lib';
	import {
		alertMessage,
		metaNamesSdk,
		selectedCoin,
		walletAddress,
		walletConnected
	} from '$lib/stores';
	import Select, { Option } from '@smui/select';
	import ConnectionRequired from '../../../components/ConnectionRequired.svelte';
	import LoadingButton from '../../../components/LoadingButton.svelte';

	import type { BYOC } from '@metanames/sdk';
	import { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import IconButton from '@smui/icon-button';
	import { onMount } from 'svelte';

	export let domainName: string;
	export let tld: string;

	let years = 1;
	let feesApproved = false;
	let availableCoins: BYOC[] = $metaNamesSdk.config.byoc;

	$: nameWithoutTLD = domainName.endsWith(`.${tld}`)
		? domainName.replace(`.${tld}`, '')
		: domainName;
	$: charsLabel = nameWithoutTLD.length > 1 ? 'chars' : 'char';
	$: loadFees = $metaNamesSdk.domainRepository.calculateMintFees(domainName, $selectedCoin);
	$: nameLength = nameWithoutTLD.length > 6 ? '6+' : nameWithoutTLD.length;
	$: yearsLabel = years === 1 ? 'year' : 'years';

	onMount(() => {
		if (!$selectedCoin) selectedCoin.set($metaNamesSdk.config.byoc[0].symbol);
	});

	const totalFeesLabel = (label: number, years: number) => {
		const total = label * years;

		return Math.ceil(total * 10000) / 10000;
	};

	function addYears(amount: number) {
		if (years + amount < 1) return;

		years += amount;
	}

	async function approveFees() {
		if (!$walletConnected) return;

		const transactionIntent = await $metaNamesSdk.domainRepository.approveMintFees(
			domainName,
			$selectedCoin,
			years
		);
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) throw new Error('Failed to approve mint fees.');
		else feesApproved = true;
	}

	async function registerDomain() {
		const address = $walletAddress;
		if (!address) return;

		if (!feesApproved) throw new Error('Fees not approved');

		const transactionIntent = await $metaNamesSdk.domainRepository.register({
			domain: domainName,
			to: address,
			subscriptionYears: years,
			byocSymbol: $selectedCoin
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
			<h4>{domainName}</h4>

			<div class="years">
				<IconButton
					class="material-icons"
					on:click={() => addYears(-1)}
					disabled={years === 1 || feesApproved}>remove</IconButton
				>
				<span>{years} {yearsLabel}</span>
				<IconButton class="material-icons" on:click={() => addYears(1)} disabled={feesApproved}
					>add</IconButton
				>
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
					<div class="row">
						<span>1 year registration for <b>{nameLength} {charsLabel}</b></span>
						<span>{fees.feesLabel} {fees.symbol}</span>
					</div>
					<div class="row">
						<span>Total (excluding network fees)</span>
						<span><b>{totalFeesLabel(fees.feesLabel, years)}</b> {fees.symbol}</span>
					</div>
				{/await}
			</div>

			<ConnectionRequired class="mt-1">
				<div class="submit">
					<LoadingButton disabled={feesApproved} onClick={approveFees} variant="raised">
						<Label>Approve fees</Label>
					</LoadingButton>
				</div>
				<div class="submit mt-1">
					<LoadingButton disabled={!feesApproved} onClick={registerDomain} variant="raised">
						<Label>Register domain</Label>
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

		.centered {
			flex-direction: column;
			align-items: center;
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
