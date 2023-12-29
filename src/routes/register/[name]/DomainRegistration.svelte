<script lang="ts">
	import { metaNamesSdk, walletAddress, walletConnected } from '$lib/stores';
	import Card, { Content } from '@smui/card';
	import IconButton from '@smui/icon-button';

	import LoadingButton from '../../LoadingButton.svelte';

	import { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import ConnectionRequired from './ConnectionRequired.svelte';

	export let domainName: string;
	export let tld: string;

	let years = 1;
	let feesApproved = false;

	$: nameWithoutTLD = domainName.endsWith(`.${tld}`)
		? domainName.replace(`.${tld}`, '')
		: domainName;
	$: charsLabel = nameWithoutTLD.length > 1 ? 'chars' : 'char';
	$: fees = $metaNamesSdk.domainRepository.calculateMintFees(domainName);
	$: nameLength = nameWithoutTLD.length > 5 ? '5+' : nameWithoutTLD.length;
	$: totalFeesAmount = fees.amount * years;
	$: yearsLabel = years === 1 ? 'year' : 'years';

	function addYears(amount: number) {
		if (years + amount < 1) return;

		years += amount;
	}

	async function approveFees() {
		if (!$walletConnected) return;

		const { hasError, trxHash: approveTrx } = await $metaNamesSdk.domainRepository.approveMintFees(
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
			await $metaNamesSdk.domainRepository.register({
				domain: domainName,
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

			<ConnectionRequired class="mt-1">
				<div class="submit">
					<LoadingButton
						disabled={feesApproved}
						onClick={approveFees}
						variant="raised"
					>
						<Label>Approve fees</Label>
					</LoadingButton>
				</div>
				<div class="submit mt-1">
					<LoadingButton
						disabled={!feesApproved}
						onClick={registerDomain}
						variant="raised"
					>
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
