<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import IconButton from '@smui/icon-button/src/IconButton.svelte';
	import Textfield from '@smui/textfield';

	import type { RecordRepository } from '@metanames/sdk';
	import { alertMessage, walletConnected } from '$lib/stores';
	import { alertTransactionAndFetchResult, getRecordClassFrom } from '$lib';

	export let klass: string;
	export let value: string;
	export let repository: RecordRepository;
	export let editMode = false;

	let recordValue = String(value);
	let dialogOpen = false;

	$: label = klass.toString();
	$: disabled = !edit;

	let edit = false;

	function toggleEdit() {
		edit = !edit;
	}

	async function save() {
		const recordClass = getRecordClassFrom(klass);
		const transactionIntent = await repository.update({ class: recordClass, data: recordValue });
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) alertMessage.set('Failed to update record.');
		else toggleEdit();
	}

	async function destroy() {
		const recordClass = getRecordClassFrom(klass);
		const transactionIntent = await repository.delete(recordClass);
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (hasError) alertMessage.set('Failed to delete record.');
		else location.reload();
	}
</script>

<div class="record-container {editMode ? 'edit' : ''}">
	<Dialog
		bind:open={dialogOpen}
		aria-labelledby="confirmation-title"
		aria-describedby="confirmation-content"
	>
		<Title id="simple-title">Confirm action</Title>
		<Content id="simple-content">Do you really want to remove the record?</Content>
		<Actions>
			<Button>
				<Label>No</Label>
			</Button>
			<Button on:click={destroy}>
				<Label>Yes</Label>
			</Button>
		</Actions>
	</Dialog>
	<label for={label}>{label}</label>
	<Textfield for={label} bind:value={recordValue} variant="outlined" textarea {disabled} />
	{#if edit}
		<div class="actions">
			<IconButton class="material-icons" on:click={save}>save</IconButton>
			<IconButton class="material-icons" on:click={toggleEdit}>cancel</IconButton>
		</div>
	{:else if editMode}
		<div class="actions">
			<IconButton class="material-icons" on:click={toggleEdit} disabled={!$walletConnected}
				>edit</IconButton
			>
			<IconButton
				class="material-icons"
				on:click={() => (dialogOpen = true)}
				disabled={!$walletConnected}>delete</IconButton
			>
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

		:global(textarea:disabled) {
			color: white !important;
		}
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
