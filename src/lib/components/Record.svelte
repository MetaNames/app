<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import Input from '$lib/components/Input.svelte';
	import Icon from '$lib/components/Icon.svelte';

	import type { RecordRepository } from '@metanames/sdk';
	import { alertMessage, refresh, walletConnected } from '$lib/stores/main';
	import { alertTransactionAndFetchResult, getRecordClassFrom, getValidator } from '$lib';

	export let klass: string;
	export let value: string;
	export let repository: RecordRepository;
	export let editMode = false;

	let recordValue = String(value);
	let dialogOpen = false;

	$: label = klass.toString();
	$: recordClass = getRecordClassFrom(klass);
	$: invalid = !validator.validate(
		{ data: recordValue, class: recordClass },
		{ raiseError: false }
	);
	$: errors = invalid ? validator.getErrors() : [];
	$: disabled = !edit;
	$: validator = getValidator(klass);
	$: maxLength = 'maxLength' in validator.rules ? (validator.rules['maxLength'] as number) : 64;

	let edit = false;

	function toggleEdit(restore = true) {
		edit = !edit;
		if (restore) recordValue = value;
	}

	async function save() {
		const transactionIntent = await repository.update({ class: recordClass, data: recordValue });
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) alertMessage.set('Failed to update record.');
		else toggleEdit(false);
	}

	async function destroy() {
		const transactionIntent = await repository.delete(recordClass);
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) alertMessage.set('Failed to delete record.');
		else refresh.set(true);
	}
</script>

<div class="record-container {editMode ? 'edit' : ''}">
	<Dialog
		bind:open={dialogOpen}
		title="Confirm action"
	>
		<p>Do you really want to remove the record?</p>
		<svelte:fragment slot="actions">
			<Button variant="secondary" on:click={() => dialogOpen = false}>
				No
			</Button>
			<Button variant="primary" on:click={destroy}>
				Yes
			</Button>
		</svelte:fragment>
	</Dialog>
	<label for={label}>{label}</label>
	<div class="value">
		<Input
			id={label}
			type="textarea"
			maxlength={maxLength}
			bind:value={recordValue}
			error={errors.length > 0 ? errors.join(', ') : ''}
			{disabled}
		>
			<svelte:fragment slot="helper">
				{#if errors.length > 0}
					<span class="helper-text error">{errors.join(', ')}</span>
				{/if}
			</svelte:fragment>
		</Input>
		<span class="counter">0 / {maxLength}</span>
	</div>
	{#if edit}
		<div class="actions">
			<IconButton on:click={save} aria-label="save-record">
				<Icon icon="save" />
			</IconButton>
			<IconButton on:click={() => toggleEdit()} aria-label="cancel-edit">
				<Icon icon="cancel" />
			</IconButton>
		</div>
	{:else if editMode}
		<div class="actions">
			<IconButton
				on:click={() => toggleEdit()}
				disabled={!$walletConnected}
				aria-label="edit-record"
			>
				<Icon icon="edit" />
			</IconButton>
			<IconButton
				on:click={() => (dialogOpen = true)}
				disabled={!$walletConnected}
				aria-label="delete-record"
			>
				<Icon icon="delete" />
			</IconButton>
		</div>
	{/if}
</div>

<style lang="scss">
	.record-container {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 2fr;
		align-items: center;
		justify-content: space-between;
		&.edit {
			display: grid;
			grid-template-columns: 1fr 2fr 1fr;
		}

		.value {
			:global(> *) {
				width: 100%;
			}
		}

		.counter {
			display: block;
			text-align: right;
			font-size: 0.75rem;
			color: var(--text-muted);
			margin-top: 0.25rem;
		}

		.helper-text {
			font-size: 0.75rem;
			color: #ef4444;
		}

		:global(textarea:disabled) {
			color: white !important;
		}
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
