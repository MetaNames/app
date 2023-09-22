<script lang="ts">
	import IconButton from '@smui/icon-button/src/IconButton.svelte';
	import Textfield from '@smui/textfield';

	import { RecordClassEnum } from '@metanames/sdk';
	import type { RecordRepository } from '@metanames/sdk';
	import { walletConnected } from '$lib/stores';

	export let klass: string;
	export let value: string;
	export let repository: RecordRepository;

	let recordValue = String(value);

	$: label = klass.toString();
	$: disabled = !edit || !walletConnected;

	let edit = false;

	function toggleEdit() {
		edit = !edit;
	}

	async function save() {
		const recordClass = RecordClassEnum[klass as keyof typeof RecordClassEnum];
		const res = await repository.update({ class: recordClass, data: recordValue });
		if (res.hasError) console.error(res.errorMessage);
		else toggleEdit();
	}
</script>

<div>
	<label for={label}>{label}</label>
	<Textfield for={label} bind:value={recordValue} variant="outlined" {disabled} />
	{#if edit}
		<IconButton class="material-icons" on:click={save}>save</IconButton>
		<IconButton class="material-icons" on:click={toggleEdit}>cancel</IconButton>
	{:else}
		<IconButton class="material-icons" on:click={toggleEdit} {disabled}>edit</IconButton>
		<IconButton class="material-icons" {disabled}>delete</IconButton>
	{/if}
</div>
