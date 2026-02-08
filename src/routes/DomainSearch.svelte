<script lang="ts">
	import Card, { Content as CardContent } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import IconButton from '@smui/icon-button';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { goto } from '$app/navigation';
	import Icon from 'src/components/Icon.svelte';

	const validator = $metaNamesSdk.domainRepository.domainValidator;

	let domain: DomainModel | null | undefined;
	let domainName: string = '';
	let nameSearched: string = '';
	let isLoading: boolean = false;
	let debounceTimer: ReturnType<typeof setTimeout>;

	$: errors = invalid ? validator.getErrors() : [];
	$: invalid = domainName !== '' && !validator.validate(domainName, { raiseError: false });
	$: nameSearchedLabel = nameSearched ? `${nameSearched}.${$metaNamesSdk.config.tld}` : null;

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

<div class="search-container">
	<form on:submit|preventDefault={submit}>
		<Textfield
			class="domain-input"
			variant="outlined"
			bind:value={domainName}
			on:input={() => debounce()}
			bind:invalid
			label="Domain name"
			withTrailingIcon
			autofocus
		>
			<svelte:fragment slot="trailingIcon">
				<div class="submit">
					<IconButton aria-label="search" type="submit">
						<Icon icon="search" />
					</IconButton>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="helper">
				{#if errors.length > 0}
					<HelperText slot="helper">{errors.join(', ')}</HelperText>
				{/if}
			</svelte:fragment>
		</Textfield>
	</form>
	{#if isLoading}
		<Card class="domain-link">
			<CardContent>
				<div class="card-content">
					<span>{nameSearchedLabel}</span>

					<CircularProgress
						style="height: 32px; width: 32px;"
						indeterminate
						aria-label="Loading domain search results"
					/>
				</div>
			</CardContent>
		</Card>
	{:else if domain}
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
	{/if}
</div>

<style lang="scss">
	@use 'sass:color';
	@use '@material/theme/color-palette';
	@use '../theme/colors.scss';

	.search-container {
		display: flex;
		flex-direction: column;
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: center;

		> div {
			margin: 0.5rem 0;
		}
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

	a:visited {
		color: var(--mdc-theme-text-primary-on-background);
	}

	:global(.domain-link) {
		margin-top: 0.2rem;
		text-decoration: none;
		color: var(--mdc-theme-text-primary-on-background);
	}

	.submit {
		align-self: center;
	}
</style>
