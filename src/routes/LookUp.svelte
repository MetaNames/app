<script lang="ts">
	import { metaNames } from '$lib';
	import { RecordClassEnum } from 'meta-names-sdk';

	import Button from '@smui/button';
	import Select, { Option } from '@smui/select';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';

	const validator = metaNames.domainRepository.domainValidator;
	const recordTypes = Object.values(RecordClassEnum).filter(
		(value) => typeof value === 'string'
	) as string[];

	let domain: string = '';
	let selectedRecord: string = RecordClassEnum[RecordClassEnum.Wallet];

	$: errors = invalid ? validator.errors : [];
	$: invalid = domain !== '' && !validator.validate(domain, { raiseError: false });

	async function submit() {
		console.log('submit');
	}
</script>

<form class="lookup-form" on:submit|preventDefault={submit}>
	<formgroup>
		<Textfield variant="outlined" bind:value={domain} bind:invalid label="Domain">
			<svelte:fragment slot="helper">
				{#if errors.length > 0}
					<HelperText slot="helper">{errors.join(', ')}</HelperText>
				{/if}
			</svelte:fragment>
		</Textfield>
	</formgroup>
	<formgroup>
		<Select variant="outlined" bind:value={selectedRecord} label="Record Type">
			{#each recordTypes as key}
				<Option value={key}>{key}</Option>
			{/each}
		</Select>
	</formgroup>

	<formgroup class="submit">
		<Button variant="raised" type="submit">Look Up</Button>
	</formgroup>
</form>

<style lang="scss">
	form {
		> formgroup {
			margin: 0 1rem;
		}

		.submit {
			display: flex;
			align-items: center;
		}

		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
	}

	@media only screen and (max-width: 900px) {
		form {
			> formgroup {
				margin: 0.5rem 0;
			}
			flex-direction: column;
			align-items: center;
		}
	}
</style>
