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
	$: selectRecordInvalid = newRecordSubmitted && selectedRecordClass === '';
	$: recordValueInvalid = newRecordSubmitted && newRecordValue === '';

	let editMode = false;
	let selectedRecordClass: string | undefined;
	let newRecordValue: string = '';
	let newRecordSubmitted = false;

	async function createRecord() {
		if (selectedRecordClass === undefined) selectedRecordClass = '';
		newRecordSubmitted = true;

		if (selectRecordInvalid || recordValueInvalid || !selectedRecordClass) return;

		const recordClass = getRecordClassFrom(selectedRecordClass);
		const res = await repository.create({ class: recordClass, data: newRecordValue });
		if (res.hasError) console.error(res.errorMessage);
		else {
			records[selectedRecordClass] = newRecordValue;
			selectedRecordClass = undefined;
			newRecordValue = '';
			newRecordSubmitted = false;
		}
	}
</script>

<div class="records">
	<formgroup>
		{#each Object.keys(records) as key}
			<RecordComponent {repository} klass={key} value={records[key]} {editMode} />
		{/each}
	</formgroup>
	<br />
	{#if !editMode}
		<Button variant="raised" on:click={() => (editMode = true)} {disabled}>Edit</Button>
	{:else}
		<formgroup class="add-record">
			<Select
				class="mobile--mt-1"
				bind:value={selectedRecordClass}
				label="Select Class"
				invalid={selectRecordInvalid}
				variant="outlined"
			>
				{#each unusedRecordsClasses as klass}
					<Option value={klass}>{klass}</Option>
				{/each}
			</Select>
			<Textfield
				class="mobile--mt-1"
				bind:value={newRecordValue}
				label="Record value"
				invalid={recordValueInvalid}
				variant="outlined"
			/>
			<Button class="mobile--mt-1" variant="raised" on:click={createRecord}>Add record</Button>
		</formgroup>
	{/if}
</div>

<style lang="scss">
	br {
		margin: 1rem 0;
	}
	.records {
		display: flex;
		flex-direction: column;
		align-items: center;

		& formgroup {
			margin: 0.5rem 0;
			width: 100%;
		}
	}

	@media (max-width: 800px) {
		.records {
			& formgroup {
				width: 100%;
			}
			& .add-record {
				width: 100%;
				display: flex;
				flex-direction: column;
			}
		}
	}
</style>
