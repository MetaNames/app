<script lang="ts">
	import type { RecordRepository } from '@metanames/sdk';
	import { RecordClassEnum } from '@metanames/sdk';

	import { alertTransactionAndFetchResult, getRecordClassFrom, getValidator } from '$lib';
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

	$: canEdit = $walletAddress === ownerAddress;
	$: newRecordClass = selectedRecordClass && getRecordClassFrom(selectedRecordClass);
	$: existingRecordClasses = Object.keys(records);
	$: unusedRecordsClasses = Object.values(RecordClassEnum).filter(
		(klass) => typeof klass === 'string' && !existingRecordClasses.includes(klass)
	);
	$: selectRecordInvalid = newRecordSubmitted && selectedRecordClass === '';
	$: recordValueInvalid =
		!!newRecordClass &&
		!validator?.validate({ data: newRecordValue, class: newRecordClass }, { raiseError: false });
	$: recordValueErrors = validator && recordValueInvalid ? validator.getErrors() : [];
	$: validator = selectedRecordClass !== undefined ? getValidator(selectedRecordClass) : undefined;
	$: newRecordValueMaxLength =
		validator && 'maxLength' in validator.rules ? (validator.rules['maxLength'] as number) : 64;

	async function createRecord() {
		if (selectedRecordClass === undefined) selectedRecordClass = '';
		newRecordSubmitted = true;

		if (selectRecordInvalid || recordValueInvalid || !selectedRecordClass) return;

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
			{#each Object.keys(records) as key (key)}
				<div class="mt-1">
					<RecordComponent {repository} klass={key} value={records[key]} editMode={true} />
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
				invalid={selectRecordInvalid}
				variant="outlined"
			>
				{#each unusedRecordsClasses as klass (klass)}
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
