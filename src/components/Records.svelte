<script lang="ts">
	import type { RecordRepository } from '@metanames/sdk';
	import { RecordClassEnum } from '@metanames/sdk';

	import { alertTransactionAndFetchResult, getRecordClassFrom } from '$lib';
	import { walletAddress } from '$lib/stores/main';

	import Button, { Label } from '@smui/button';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';
	import RecordComponent from 'src/components/Record.svelte';

	export let ownerAddress: string;
	export let records: Record<string, string>;
	export let repository: RecordRepository;

	const validator = repository.recordValidator;
	let editMode = false;
	let selectedRecordClass: string | undefined;
	let newRecordValue: string = '';
	let newRecordSubmitted = false;

	$: canEdit = $walletAddress === ownerAddress;
	$: newRecordClass = selectedRecordClass && getRecordClassFrom(selectedRecordClass);
	$: existingRecordClasses = Object.keys(records);
	$: unusedRecordsClasses = Object.values(RecordClassEnum).filter(
		(klass) => typeof klass === 'string' && !existingRecordClasses.includes(klass)
	);
	$: selectRecordInvalid = newRecordSubmitted && selectedRecordClass === '';
	$: editLabel = records && Object.keys(records).length > 0 ? 'Edit records' : 'Add record';
	$: recordValueInvalid =
		newRecordSubmitted &&
		!!newRecordClass &&
		!validator.validate({ data: newRecordValue, class: newRecordClass }, { raiseError: false });

	async function createRecord() {
		if (selectedRecordClass === undefined) selectedRecordClass = '';
		newRecordSubmitted = true;

		if (selectRecordInvalid || recordValueInvalid || !selectedRecordClass) {
			const message =
				validator.errors.length > 0
					? validator.errors.join(', ')
					: 'Invalid fields. Please check the form.';
			throw new Error(message);
		}

		const recordClass = getRecordClassFrom(selectedRecordClass);
		const transactionIntent = await repository.create({ class: recordClass, data: newRecordValue });
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) throw new Error('Failed to create record.');
		else {
			records[selectedRecordClass] = newRecordValue;
			selectedRecordClass = undefined;
			newRecordValue = '';
			newRecordSubmitted = false;
		}
	}
</script>

<div class="records">
	<div>
		{#if !records || Object.keys(records).length === 0}
			<p class="no-records">No records found</p>
		{:else}
			{#each Object.keys(records) as key}
				<div class="mt-1">
					<RecordComponent {repository} klass={key} value={records[key]} {editMode} />
				</div>
			{/each}
		{/if}
	</div>
	{#if canEdit}
		<br />
		{#if !editMode}
			<Button variant="raised" on:click={() => (editMode = true)}>{editLabel}</Button>
		{:else}
			<div class="add-record">
				<Select
					class="mr-1 mobile--mt-1 mobile--mr-0 mobile--w-100"
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
					class="mr-1 mobile--mt-1 mobile--mr-0 mobile--w-100"
					bind:value={newRecordValue}
					label="Record value"
					invalid={recordValueInvalid}
					variant="outlined"
				/>
				<LoadingButton class="mobile--mt-1" onClick={createRecord} variant="raised">
					<Label>Add record</Label>
				</LoadingButton>
			</div>
		{/if}
	{:else}
		<ConnectionRequired />
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

		& div {
			margin: 0.5rem 0;
			width: 100%;
		}

		& .add-record {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		& .no-records {
			margin: 2rem 0;
			text-align: center;
			font-size: large;
			color: gray;
		}
	}

	@media (max-width: 768px) {
		.records {
			& div {
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
