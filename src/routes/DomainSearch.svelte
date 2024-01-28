<script lang="ts">
	import Card, { Content as CardContent } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import type { Domain as DomainModel } from '@metanames/sdk/lib/models/domain';
	import IconButton from '@smui/icon-button/src/IconButton.svelte';
	import { metaNamesSdk } from '$lib/stores';
	import { goto } from '$app/navigation';

	const validator = $metaNamesSdk.domainRepository.domainValidator;

	let domain: DomainModel | null | undefined;
	let domainName: string = '';
	let nameSearched: string = '';
	let isLoading: boolean = false;
	let debounceTimer: NodeJS.Timer;

	$: errors = invalid ? validator.errors : [];
	$: invalid = domainName !== '' && !validator.validate(domainName, { raiseError: false });
	$: nameSearchedLabel = nameSearched ? `${nameSearched}.meta` : null;

	function debounce() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => await search(), 400);
	}

	async function search(submit = false) {
		if (invalid) return;

		if (domainName === '') return;
		if (submit && domainName === nameSearched) {
			const url = domain ? `/domain/${nameSearched}` : `/register/${nameSearched}`;

			return goto(url);
		}

		nameSearched = domainName.toLocaleLowerCase();
		isLoading = true;

		domain = await $metaNamesSdk.domainRepository.find(domainName);

		isLoading = false;
	}

	async function submit() {
		await search(true);
	}
</script>

<form class="lookup-form" on:submit|preventDefault={submit}>
	<div>
		<Textfield
			class="domain-input"
			variant="outlined"
			bind:value={domainName}
			on:keyup={() => debounce()}
			bind:invalid
			label="Domain name"
			withTrailingIcon
			autofocus
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
	</div>
</form>
{#if domain}
	<a class="domain-link" href={`/domain/${domain.name}`}>
		<Card>
			<CardContent>
				<div class="card-content">
					<span>{nameSearchedLabel}</span>
					<span class="chip registered">Registered</span>
				</div>
			</CardContent>
		</Card>
	</a>
{:else if domain === null}
	<a class="domain-link" href={`/register/${nameSearched}`}>
		<Card>
			<CardContent>
				<div class="card-content">
					<span>{nameSearchedLabel}</span>
					<span class="chip available">Available</span>
				</div>
			</CardContent>
		</Card>
	</a>
{:else if isLoading}
	<Card>
		<CardContent>
			<div class="card-content">
				<span>{nameSearchedLabel}</span>

				<CircularProgress style="height: 32px; width: 32px;" indeterminate />
			</div>
		</CardContent>
	</Card>
{/if}

<style lang="scss">
	@use 'sass:color';
	@use '@material/theme/color-palette';
	@use '../theme/colors.scss';

	form {
		> div {
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
		background-color: color-palette.$grey-300;
		font-weight: 700;

		&.available {
			background-color: color.scale(color-palette.$light-green-400, $whiteness: 50%);
			color: color-palette.$light-green-900;
		}

		&.registered {
			background-color: color.scale(colors.$primary, $whiteness: 60%);
			color: color.scale(colors.$primary, $whiteness: -20%);
		}
	}

	:global(.domain-input) {
		width: 60vw;

		@media screen and (max-width: 600px) {
			width: 80vw;
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
