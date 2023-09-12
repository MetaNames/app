<script lang="ts">
	import { metaNamesSdk } from '$lib';

	import Card, { Content as CardContent } from '@smui/card';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import type { Domain as DomainModel } from '@metanames/sdk/lib/models/domain';
	import IconButton from '@smui/icon-button/src/IconButton.svelte';

	const validator = metaNamesSdk.domainRepository.domainValidator;

	let domain: DomainModel | null;
	let domainName: string = '';
	let nameSearched: string = '';
	let isLoading: boolean = false;

	$: errors = invalid ? validator.errors : [];
	$: invalid = domainName !== '' && !validator.validate(domainName, { raiseError: false });

	async function submit() {
		if (invalid) return;

		nameSearched = domainName;
		isLoading = true;

		if (domainName === '') {
			invalid = true;
		} else domain = await metaNamesSdk.domainRepository.find(domainName);

		isLoading = false;
	}
</script>

<form class="lookup-form" on:submit|preventDefault={submit}>
	<formgroup>
		<Textfield
			variant="outlined"
			bind:value={domainName}
			bind:invalid
			label="Domain"
			withTrailingIcon={true}
		>
			<svelte:fragment slot="trailingIcon">
				<div class="submit">
					<IconButton class="material-icons">search</IconButton>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="helper">
				{#if errors.length > 0}
					<HelperText slot="helper">{errors.join(', ')}</HelperText>
				{/if}
			</svelte:fragment>
		</Textfield>
	</formgroup>
</form>
{#if domain}
	<a class="domain-link" href={`/domain/${domain.name}`}>
		<Card>
			<CardContent>
				<div class="card-content">
					<span>{nameSearched}</span>
					<span class="chip registered">registered</span>
				</div>
			</CardContent>
		</Card>
	</a>
{:else if domain === null}
	<a class="domain-link" href={`/register/${nameSearched}`}>
		<Card>
			<CardContent>
				<div class="card-content">
					<span>{nameSearched}</span>
					<span class="chip available">available</span>
				</div>
			</CardContent>
		</Card>
	</a>
{:else if isLoading}
	<Card>
		<CardContent>
			<div class="card-content">
				<span>{nameSearched}</span>

				<span class="chip">loading spinner</span>
			</div>
		</CardContent>
	</Card>
{/if}

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
		background-color: color-palette.$grey-300;

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

	.submit {
		align-self: center;
	}
</style>
