<script lang="ts">
	import { metaNames } from '$lib';
	import { RecordClassEnum } from '@metanames/sdk';

	import Button from '@smui/button';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import type { Domain as DomainModel } from '@metanames/sdk/lib/models/domain';
	import Domain from './Domain.svelte';

	const validator = metaNames.domainRepository.domainValidator;

	let domain: DomainModel | null;
	let domainName: string = '';

	$: errors = invalid ? validator.errors : [];
	$: invalid = domainName !== '' && !validator.validate(domainName, { raiseError: false });

	async function submit() {
		if (domainName === '') {
			invalid = true;
		} else domain = await metaNames.domainRepository.find(domainName);
	}
</script>

<form class="lookup-form" on:submit|preventDefault={submit}>
	<formgroup>
		<Textfield variant="outlined" bind:value={domainName} bind:invalid label="Domain">
			<svelte:fragment slot="helper">
				{#if errors.length > 0}
					<HelperText slot="helper">{errors.join(', ')}</HelperText>
				{/if}
			</svelte:fragment>
		</Textfield>
	</formgroup>

	<formgroup class="submit">
		<Button variant="raised" type="submit">Find</Button>
	</formgroup>
</form>
{#if domain}
	<div class="domain-container">
		<Domain {domain} />
	</div>
{:else if domain === null}
	<p>Not found</p>
{/if}

<style lang="scss">
	form {
		> formgroup {
			margin: 0.5rem 0;
		}

		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.domain-container {
		margin-top: 1rem;
	}
</style>
