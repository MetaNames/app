<script lang="ts">
	import type { RecordRepository } from '@metanames/sdk';
	import { RecordClassEnum } from '@metanames/sdk';
	import { createEventDispatcher } from 'svelte';

	import { getRecordClassFrom, getValidator } from '$lib';
	import { runTransaction } from '$lib/transaction';
	import { walletAddress } from '$lib/stores/main';

	import { Label } from '@smui/button';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';
	import RecordComponent from 'src/components/Record.svelte';
	import HelperText from '@smui/textfield/helper-text';

	export let ownerAddress: string;
	export let records: Record<string, string>;
	export let repository: RecordRepository;

	let selectedRecordClass: string | undefined;
	let newRecordValue: string = '';
	let newRecordSubmitted = false;
	// Locally created records (class -> value), layered over the prop.
	// The prop itself is never mutated.
	let createdRecords: Record<string, string> = {};

	// Validator is declared first so dependents below always see it.
	$: validator = selectedRecordClass !== undefined ? getValidator(selectedRecordClass) : undefined;
	$: canEdit = $walletAddress === ownerAddress;
	$: newRecordClass = selectedRecordClass && getRecordClassFrom(selectedRecordClass);
	$: allRecords = { ...records, ...createdRecords };
	$: existingRecordClasses = Object.keys(allRecords);
	$: unusedRecordsClasses = Object.values(RecordClassEnum).filter(
		(klass) => typeof klass === 'string' && !existingRecordClasses.includes(String(klass))
	);
	$: selectRecordInvalid = newRecordSubmitted && selectedRecordClass === '';
	$: recordValueInvalid =
		!!newRecordClass &&
		!validator?.validate({ data: newRecordValue, class: newRecordClass }, { raiseError: false });
	$: recordValueErrors = validator && recordValueInvalid ? validator.getErrors() : [];
	$: newRecordValueMaxLength =
		validator && 'maxLength' in validator.rules ? (validator.rules['maxLength'] as number) : 64;

	const dispatch = createEventDispatcher<{ created: string }>();

	async function createRecord() {
		if (selectedRecordClass === undefined) selectedRecordClass = '';
		newRecordSubmitted = true;

		if (selectRecordInvalid || recordValueInvalid || !selectedRecordClass) return;

		const recordClass = getRecordClassFrom(selectedRecordClass);
		const transactionIntent = await repository.create({ class: recordClass, data: newRecordValue });
		await runTransaction(transactionIntent, 'Failed to create record.');
		// Immutable local update instead of mutating the prop; parent is notified
		// so it can refresh its own copy of the records when it needs to.
		createdRecords = { ...createdRecords, [recordClass]: newRecordValue };
		dispatch('created', String(recordClass));
		selectedRecordClass = undefined;
		newRecordValue = '';
		newRecordSubmitted = false;
	}
</script>

<div class="records">
	<div>
		{#if !allRecords || Object.keys(allRecords).length === 0}
			<p class="no-records">No records found</p>
		{:else}
			{#each Object.keys(allRecords) as key (key)}
				<div class="mt-1">
					<RecordComponent {repository} klass={key} value={allRecords[key]} editMode={true} />
				</div>
			{/each}
		{/if}
	</div>
	{#if canEdit}
		<br />
		<div class="add-record">
			<Select
				class="mr-1 mobile--mt-1 mobile--mr-0 mobile--w-100"
				bind:value={selectedRecordClass}
				label="Select Type"
				anchor$aria-label="Select Type"
				invalid={selectRecordInvalid}
				variant="outlined"
			>
				{#each unusedRecordsClasses as klass}
					<Option value={klass}>{klass}</Option>
				{/each}
			</Select>
			<div class="value">
				<Textfield
					class="mr-1 mobile--mt-1 mobile--mr-0 mobile--w-100"
					bind:value={newRecordValue}
					input$maxlength={newRecordValueMaxLength}
					label="Record value"
					bind:invalid={recordValueInvalid}
					input$aria-invalid={recordValueInvalid}
					variant="outlined"
				>
					<svelte:fragment slot="helper">
						{#if recordValueErrors.length > 0}
							<HelperText class="error" slot="helper">{recordValueErrors?.join(', ')}</HelperText>
						{/if}
					</svelte:fragment>
				</Textfield>
			</div>
			<LoadingButton
				class="mobile--mt-1"
				disabled={newRecordClass === undefined || recordValueInvalid}
				onClick={createRecord}
				variant="raised"
			>
				<Label>Add record</Label>
			</LoadingButton>
		</div>
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
			align-items: baseline;
			min-height: 70pt;

			& .value {
				width: auto;
			}
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

				& .value {
					width: 100%;
				}
			}
		}
	}
</style>
