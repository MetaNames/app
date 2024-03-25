<script lang="ts">
	import Card, { Content } from '@smui/card';
	import Radio from '@smui/radio';
	import FormField from '@smui/form-field';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { actionVotePayload } from 'src/lib/proposal';
	import { metaNamesSdk } from 'src/lib/stores/sdk';
	import { alertTransactionAndFetchResult, config } from 'src/lib';

	import { Doughnut } from 'svelte-chartjs';
	import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, type Color } from 'chart.js';

	import { alertMessage } from 'src/lib/stores/main';
	import type { PageData } from './$types';
	import Timer from './Timer.svelte';

	export let data: PageData;

	let options = ['Yes', 'No'];
	let selected = options[0];
	let voteEnabled = true;
	let votesResult = Object.entries(data.result);

	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

	let chartOptions = {
		resposive: true,
		plugins: {
			legend: {
				position: 'bottom' as 'bottom',
				labels: {
					color: '#ffffff',
					font: {
						weight: 'bold' as 'bold'
					}
				}
			}
		}
	};
	let votesChartData = {
		labels: votesResult.map((row) => row[0]),
		datasets: [
			{
				label: 'Proposal results',
				data: votesResult.map((row) => row[1]),
				backgroundColor: ['#6849fe', '#676778'],
				// color: ['#ffffff', '#ffffff']
			}
		]
	};

	$: countFrom = data.deadlineInSeconds - Math.ceil(Date.now() / 1000);
	$: proposalPassed = data.result;
	$: if (countFrom <= 0) voteEnabled = false;

	function timesUp() {
		voteEnabled = false;
	}

	async function vote() {
		const contract = await $metaNamesSdk.contractRepository.getContract({
			contractAddress: config.tldMigrationProposalContractAddress
		});
		const payload = actionVotePayload(contract.abi, selected === 'Yes');
		const transactionIntent = await $metaNamesSdk.contractRepository.createTransaction({
			contractAddress: config.tldMigrationProposalContractAddress,
			payload
		});
		const result = await alertTransactionAndFetchResult(transactionIntent);

		if (!result.hasError) alertMessage.set('Voted successfully');
	}
</script>

<svelte:head>
	<title>TLD Migration Proposal | Meta Names</title>
</svelte:head>

<div class="content checkout">
	<Card class="w-100 flex-content">
		<Content>
			<h3>TLD Migration Proposal</h3>
			<p>
				The proposal aims to migrate Top Level Domains (TLD) from <code>.META</code> to
				<code>.MPC</code>.
				<br />
				Learn more in the
				<a
					href="https://docs.metanames.app/proposals/transition-from-.meta-to-.mpc"
					target="_blank"
				>
					<b>documentation</b></a
				>
			</p>
			{#if voteEnabled}
				<p>
					<b>Ownership of a domain is required to vote</b>
				</p>
				<p class="subtitle">
					Please allow a minimum of 10 minutes after purchasing a domain before casting your vote.
				</p>
				<h4>Proposal countdown</h4>
				<Timer class="timer" {countFrom} on:timesup={timesUp} />
				<p class="question">
					Do you want to migrate the TLD from <code>.META</code> to <code>.MPC</code>?
				</p>
				<div class="options">
					{#each options as option}
						<FormField>
							<Radio bind:group={selected} value={option} />
							<span slot="label">{option}</span>
						</FormField>
					{/each}
				</div>
				<ConnectionRequired class="mt-1">
					<LoadingButton disabled={!voteEnabled} onClick={vote} variant="raised">Vote</LoadingButton
					>
				</ConnectionRequired>
			{:else}
				<h4 class="mb-1">Voting Results</h4>
				<div class="chart">
					<Doughnut class="doughnut" data={votesChartData} options={chartOptions} />
				</div>
				<p class="title mt-3">
					<b>
						{#if proposalPassed}
							The proposal has been approved
						{:else}
							The proposal was not approved
						{/if}
					</b>
				</p>
			{/if}
		</Content>
	</Card>
	<br />
	<GoBackButton />
</div>

<style lang="scss">
	h3,
	h4 {
		margin: 1.5rem 0;
	}

	:global(.timer) {
		font-family: monospace;
		font-weight: bold;
		padding: 0 0.3em;
		border-radius: 0.3em;
		font-size: larger;
	}

	.chart {
		display: flex;
		justify-content: center;
		align-items: center;

		:global(.doughnut) {
			max-height: 18rem;
			max-width: 18rem;
		}
	}

	.subtitle {
		font-size: smaller;
	}

	.question {
		margin-top: 2rem;
		font-weight: bold;
	}

	.options > :global(*) {
		margin: 0 1rem;
	}

	.title {
		font-size: larger;
	}
</style>
