<script lang="ts">
	import Button, { Label } from '@smui/button';
	import Dialog, { Title, Content, Actions } from '@smui/dialog';
	import IconButton from '@smui/icon-button/src/IconButton.svelte';
	import Textfield from '@smui/textfield';

	import type { RecordRepository } from '@metanames/sdk';
	import { walletConnected } from '$lib/stores';
	import { getRecordClassFrom } from '$lib';

	export let klass: string;
	export let value: string;
	export let repository: RecordRepository;

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
		const res = await repository.update({ class: recordClass, data: recordValue });
		if (res.hasError) console.error(res.errorMessage);
		else toggleEdit();
	}

	async function destroy() {
		const recordClass = getRecordClassFrom(klass);
		const res = await repository.delete(recordClass);
		if (res.hasError) console.error(res.errorMessage);
		else location.reload();
	}
</script>

<div class="record-container">
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
	<Textfield for={label} bind:value={recordValue} variant="outlined" {disabled} />
	{#if edit}
		<IconButton class="material-icons" on:click={save}>save</IconButton>
		<IconButton class="material-icons" on:click={toggleEdit}>cancel</IconButton>
	{:else}
		<div class="actions">
			<IconButton class="material-icons" on:click={toggleEdit} disabled={!$walletConnected}
				>edit</IconButton
			>
			<IconButton class="material-icons" on:click={() => (dialogOpen = true)} disabled={!$walletConnected}
				>delete</IconButton
			>
		</div>
	{/if}
</div>

<style lang="scss">
	.record-container {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		align-items: center;
		justify-content: space-between;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
