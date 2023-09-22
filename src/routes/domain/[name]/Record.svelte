<script lang="ts">
	import IconButton from '@smui/icon-button/src/IconButton.svelte';
	import Textfield from '@smui/textfield';

	import { RecordClassEnum } from '@metanames/sdk';
	import type { RecordRepository } from '@metanames/sdk';

	export let klass: string;
	export let value: string;
	export let repository: RecordRepository;

	let recordValue = String(value);

	$: label = klass.toString();
	$: disabled = !edit;

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
		<IconButton class="material-icons" on:click={toggleEdit}>edit</IconButton>
		<IconButton class="material-icons">delete</IconButton>
	{/if}
</div>
