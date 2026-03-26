<script context="module" lang="ts">
	import type { Domain as DomainModel } from '@metanames/sdk';

	const MAX_CACHE_SIZE = 100;
	const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

	interface CacheEntry {
		result: DomainModel | null;
		timestamp: number;
	}

	const searchCache = new Map<string, CacheEntry>();

	export function getCachedResult(domainName: string): CacheEntry | undefined {
		const entry = searchCache.get(domainName);
		if (entry) {
			if (Date.now() - entry.timestamp > CACHE_TTL) {
				searchCache.delete(domainName);
				return undefined;
			}
			return entry;
		}
		return undefined;
	}

	export function setCachedResult(domainName: string, result: DomainModel | null) {
		if (searchCache.size >= MAX_CACHE_SIZE) {
			const firstKey = searchCache.keys().next().value;
			if (firstKey) {
				searchCache.delete(firstKey);
			}
		}
		searchCache.set(domainName, { result, timestamp: Date.now() });
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import Card, { Content as CardContent } from '@smui/card';
	import CircularProgress from '@smui/circular-progress';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
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

	onDestroy(() => {
		clearTimeout(debounceTimer);
	});

	async function search(submit = false) {
		if (invalid) return;

		if (domainName === '') return;
		if (submit && domainName === nameSearched) {
			const url = domain ? `/domain/${nameSearched}` : `/register/${nameSearched}`;

			return goto(url);
		}

		const currentRequestId = ++requestId;
		nameSearched = domainName.toLocaleLowerCase();

		const cachedResult = getCachedResult(nameSearched);
		if (cachedResult) {
			domain = cachedResult.result;
			isLoading = false;
			return;
		}

		isLoading = true;

		const result = await $metaNamesSdk.domainRepository.find(domainName);

		if (currentRequestId === requestId) {
			domain = result;
			isLoading = false;
			setCachedResult(nameSearched, result);
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
			label="Domain name"
			withTrailingIcon
			autofocus
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
