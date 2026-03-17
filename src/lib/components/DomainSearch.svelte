<script lang="ts">
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import CardComponent from './Card.svelte';
	import CircularProgressComponent from './CircularProgress.svelte';
	import Input from './Input.svelte';
	import IconButtonComponent from './IconButton.svelte';

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

		const result = await $metaNamesSdk.domainRepository.find(domainName);

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
		<div class="input-wrapper">
			<Input
				class="domain-input"
				variant="outlined"
				bind:value={domainName}
				label="Domain name"
				autofocus
			>
				<div slot="trailingIcon" class="submit">
					<IconButtonComponent aria-label="search">
						<Icon icon="search" />
					</IconButtonComponent>
				</div>
			</Input>
			{#if errors.length > 0}
				<span class="helper-text">{errors.join(', ')}</span>
			{/if}
		</div>
	</form>
	{#if isLoading}
		<a class="domain-link" href="#">
			<CardComponent>
				<div class="card-content">
					<span>{nameSearchedLabel}</span>

					<CircularProgressComponent
						style="height: 32px; width: 32px;"
						indeterminate
						aria-label="Loading domain search results"
					/>
				</div>
			</CardComponent>
		</a>
	{:else if domain}
		<a class="domain-link" href={`/domain/${domain.name}`}>
			<CardComponent>
				<div class="card-content">
					<span>{nameSearchedLabel}</span>
					<span class="chip registered">Registered</span>
				</div>
			</CardComponent>
		</a>
	{:else if domain === null}
		<a class="domain-link" href={`/register/${nameSearched}`}>
			<CardComponent>
				<div class="card-content">
					<span>{nameSearchedLabel}</span>
					<span class="chip available">Available</span>
				</div>
			</CardComponent>
		</a>
	{/if}
</div>

<style lang="scss">
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

	.input-wrapper {
		width: 100%;
		max-width: 400px;
	}

	.card-content {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.chip {
		padding: 0.3rem 0.8rem;
		border-radius: 1rem;
		font-size: 0.7rem;
		background-color: var(--surface-hover);
		font-weight: 700;

		&.available {
			background-color: rgba(34, 197, 94, 0.2);
			color: #22c55e;
		}

		&.registered {
			background-color: rgba(104, 73, 254, 0.2);
			color: var(--primary);
		}
	}

	a:visited {
		color: var(--text-primary);
	}

	:global(.domain-link) {
		margin-top: 0.2rem;
		text-decoration: none;
		color: var(--text-primary);
		display: block;
	}

	.submit {
		align-self: center;
	}

	.helper-text {
		color: var(--text-secondary);
		font-size: 0.75rem;
		margin-top: 0.25rem;
	}
</style>
