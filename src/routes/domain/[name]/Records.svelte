<script lang="ts">
	import type { RecordRepository } from '@metanames/sdk';
	import { RecordClassEnum } from '@metanames/sdk';
	import { walletConnected } from '$lib/stores';

	import Button from '@smui/button/src/Button.svelte';
	import Select, { Option } from '@smui/select';

	import RecordComponent from './Record.svelte';
	import Textfield from '@smui/textfield';
	import { getRecordClassFrom } from '$lib';

	export let records: Record<string, string>;
	export let repository: RecordRepository;

	$: disabled = !$walletConnected;
	$: existingRecordClasses = Object.keys(records);
	$: unusedRecordsClasses = Object.values(RecordClassEnum).filter(
		(klass) => typeof klass === 'string' && !existingRecordClasses.includes(klass)
	);

	let selectedRecordClass: string | undefined;
	let newRecordValue: string = '';

	async function createRecord() {
		// TODO: Add error handling
		if (!selectedRecordClass) return;

		const recordClass = getRecordClassFrom(selectedRecordClass);
		const res = await repository.create({ class: recordClass, data: newRecordValue });
		if (res.hasError) console.error(res.errorMessage);
		else {
			records[selectedRecordClass] = newRecordValue;
			selectedRecordClass = undefined;
			newRecordValue = '';
		}
	}
</script>

<div class="records">
	<formgroup>
		{#each Object.keys(records) as key}
			<RecordComponent {repository} klass={key} value={records[key]} />
		{/each}
	</formgroup>
	<br />
	<formgroup>
		<!-- TODO: Hide fields until clicking on "Add record" button -->
		<Select bind:value={selectedRecordClass} label="Select Class" {disabled}>
			{#each unusedRecordsClasses as klass}
				<Option value={klass}>{klass}</Option>
			{/each}
		</Select>
		<Textfield bind:value={newRecordValue} label="Record value" {disabled} />
		<Button variant="raised" on:click={createRecord} {disabled}>Add record</Button>
	</formgroup>
</div>

<style lang="scss">
	br {
		margin: 1rem 0;
		// TODO: Add separator color
	}
	.records {
		display: flex;
		flex-direction: column;
		align-items: center;

		& formgroup {
			margin: 0.5rem 0;
			width: 100%
		}
	}
</style>
