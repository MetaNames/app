<script lang="ts">
	import Card, { Content as CardContent } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import IconButton from '@smui/icon-button';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { loadOrReport } from '$lib/read';
	import { goto } from '$app/navigation';
	import Icon from 'src/components/Icon.svelte';

	const validator = $metaNamesSdk.domainRepository.domainValidator;

	let domain: DomainModel | null | undefined;
	let domainName: string = '';
	let nameSearched: string = '';
	let isLoading: boolean = false;
	let debounceTimer: ReturnType<typeof setTimeout>;
	let requestId = 0;

	$: errors = invalid ? validator.getErrors() : [];
	$: invalid = domainName !== '' && !validator.validate(domainName, { raiseError: false });
	$: nameSearchedLabel = nameSearched ? `${nameSearched}.${$metaNamesSdk.config.tld}` : null;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function debounce(_domainName: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => await search(), 400);
	}

	$: debounce(domainName);

	async function search(submit = false) {
		if (invalid) return;

		if (domainName === '') return;
		if (submit && domainName === nameSearched) {
			const url = domain ? `/domain/${nameSearched}` : `/register/${nameSearched}`;

			return goto(url);
		}

		const currentRequestId = ++requestId;
		nameSearched = domainName.toLocaleLowerCase();
		isLoading = true;

		// `loadOrReport` yields `undefined` on failure, which clears the result card and leaves the
		// snackbar to explain — instead of the spinner running forever.
		const result = await loadOrReport(
			$metaNamesSdk.domainRepository.find(domainName),
			'Could not search for that domain. Please try again.'
		);

		if (currentRequestId === requestId) {
			domain = result;
			isLoading = false;
		}
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
			bind:invalid
			input$aria-invalid={invalid}
			label="Domain name"
			withTrailingIcon
		>
			<svelte:fragment slot="trailingIcon">
				<div class="submit">
					<IconButton aria-label="search">
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
	<!--
		One region, not one per branch: a `role="status"` element that is inserted into the DOM is
		announced unreliably, while a change of text inside a region that was already there is
		announced by every screen reader.
	-->
	<div role="status" aria-live="polite" aria-atomic="true">
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
			<a class="domain-link" href={`/domain/${domain.name}`} data-testid="domain-result-registered">
				<Card>
					<CardContent>
						<div class="card-content">
							<span>{nameSearchedLabel}</span>
							<span class="chip registered" data-testid="domain-status-registered">Registered</span>
						</div>
					</CardContent>
				</Card>
			</a>
		{:else if domain === null}
			<a
				class="domain-link"
				href={`/register/${nameSearched}`}
				data-testid="domain-result-available"
			>
				<Card>
					<CardContent>
						<div class="card-content">
							<span>{nameSearchedLabel}</span>
							<span class="chip available" data-testid="domain-status-available">Available</span>
						</div>
					</CardContent>
				</Card>
			</a>
		{/if}
	</div>
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
