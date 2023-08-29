<script lang="ts">
	import { metaNamesSdk } from '$lib';

	import Button from '@smui/button';
	import Card, { Content as CardContent } from '@smui/card';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import type { Domain as DomainModel } from '@metanames/sdk/lib/models/domain';

	const validator = metaNamesSdk.domainRepository.domainValidator;

	let domain: DomainModel | null;
	let domainName: string = '';
	let nameSearched: string = '';

	$: errors = invalid ? validator.errors : [];
	$: invalid = domainName !== '' && !validator.validate(domainName, { raiseError: false });
	$: pageRedirectLink = domain ? `/domain/${domain.name}` : `/register/${nameSearched}`;

	async function submit() {
		nameSearched = domainName;

		if (domainName === '') {
			invalid = true;
		} else domain = await metaNamesSdk.domainRepository.find(domainName);
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
<a class="domain-link" href={pageRedirectLink}>
	{#if domain}
		<Card>
			<CardContent>
				<div class="card-content">
					<span>{nameSearched}</span>
					<span class="chip registered">registered</span>
				</div>
			</CardContent>
		</Card>
	{:else if domain === null}
		<Card>
			<CardContent>
				<div class="card-content">
					<span>{nameSearched}</span>
					<span class="chip available">available</span>
				</div>
			</CardContent>
		</Card>
	{/if}
</a>

<style lang="scss">
	@use '@material/theme/color-palette';

	form {
		> formgroup {
			margin: 0.5rem 0;
		}

		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.card-content {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.chip {
		padding: 0.3rem;
		border-radius: 1rem;
		font-size: 0.7rem;
		font-weight: 500;

		&.available {
			background-color: color-palette.$light-green-300;
		}

		&.registered {
			background-color: color-palette.$orange-a200;
		}
	}

	.domain-link {
		text-decoration: none;
		color: inherit;
	}
</style>
