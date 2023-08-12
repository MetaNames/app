<script lang="ts">
	import type { Domain } from 'meta-names-sdk/lib/models/domain';

	import Card, { Content as CardContent } from '@smui/card';
	import { Icon } from '@smui/icon-button';
	import Select, { Option } from '@smui/select';

	export let domain: Domain;

	let selectedRecord: string;
</script>

<Card>
	<CardContent>
		<h5 class="domain">{domain.name}</h5>
		<div class="details-row">
			<span class="icon">
				<Icon class="material-icons" aria-label="Parent">supervisor_account</Icon>
			</span>
			<div>{domain.parentId || 'Parent not present'}</div>
		</div>
		<div class="details-row">
			<span class="icon">
				<Icon class="material-icons" aria-label="Owner">person</Icon>
			</span>
			<span>{domain.owner}</span>
		</div>
		<h6>Records</h6>
		<formgroup>
			<Select bind:value={selectedRecord} label="Record type" variant="outlined">
				{#each domain.records as [key]}
					<Option value={key}>{key}</Option>
				{/each}
			</Select>
		</formgroup>
		{#if selectedRecord}
			<div class="value-container">
				<p>Value</p>
				<span>{domain.records.get(selectedRecord)}</span>
			</div>
		{/if}
	</CardContent>
</Card>

<style lang="scss">
	h6 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	.icon {
		padding: 0.5rem;
	}

	.domain {
		text-transform: uppercase;
		margin-top: 0rem;
		margin-bottom: 1rem;
	}

	.details-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 1rem;
	}

	.value-container {
		margin-top: 1rem;

		> span {
			font-family: monospace;
			word-wrap: break-word;
		}
	}
</style>
