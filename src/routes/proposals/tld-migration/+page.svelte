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
	import { alertMessage } from 'src/lib/stores/main';

	let options = ['Yes', 'No'];
	let selected = options[0];

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
	<h2 class="mt-0">Migration Proposal</h2>
	<Card class="w-100 flex-content">
		<Content>
			<h4>Migrate from .META to .MPC</h4>
			<p>
				Learn about the proposal to migrate Top Level Domains from .META to .MPC in the
				<a href="https://docs.metanames.app" target="_blank"> <b>documentation</b></a>
			</p>
			<p>
				<b>Ownership of a domain is required to vote</b>
			</p>
			<p>
				Please allow a minimum of 10 minutes after purchasing a domain before casting your vote.
			</p>
			<p class="question">Do you want to migrate the TLD from .META to .MPC?</p>
			<div class="options">
				{#each options as option}
					<FormField>
						<Radio bind:group={selected} value={option} />
						<span slot="label">{option}</span>
					</FormField>
				{/each}
			</div>
			<ConnectionRequired class="mt-1">
				<LoadingButton onClick={vote} variant="raised">Vote</LoadingButton>
			</ConnectionRequired>
		</Content>
	</Card>
	<br />
	<GoBackButton />
</div>

<style>
	h4 {
		margin: 1.5rem 0;
	}

	.question {
		margin-top: 2rem;
		font-weight: bold;
	}

	.options > :global(*) {
		margin: 0 1rem;
	}
</style>
