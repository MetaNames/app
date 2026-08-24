<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import { onMount } from 'svelte';
	import { filterDomainsByName } from '$lib/filter';
	import { walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { loadOrReport } from '$lib/read';

	import Paper from '@smui/paper';
	import DomainsTable from './DomainsTable.svelte';
	import Textfield from '@smui/textfield';
	import IconButton from '@smui/icon-button';
	import Icon from 'src/components/Icon.svelte';
	import Chip from 'src/components/Chip.svelte';

	let domains: Domain[] = [];
	let domainsFiltered: Domain[] = [];
	let loaded = false;
	let search = '';
	let requestId = 0;

	$: domainsFiltered = filterDomainsByName(domains, search);

	onMount(() =>
		walletAddress.subscribe(async (address) => {
			if (!address) return;

			// Switching wallets starts a second lookup while the first is in flight; without
			// this guard a slower earlier response overwrites the newer owner's domains.
			const currentRequestId = ++requestId;
			loaded = false;

			const owned = await loadOrReport(
				$metaNamesSdk.domainRepository.findByOwner(address),
				'Could not load your domains. Please try again.'
			);
			if (currentRequestId !== requestId) return;

			// Even a failed read has to stop the table's progress bar; the snackbar carries why.
			domains = owned ?? [];
			loaded = true;
		})
	);

	function cleanSearch() {
		search = '';
	}
</script>

<svelte:head>
	<title>Profile | Meta Names</title>
</svelte:head>

<div class="profile content">
	<Paper class="w-100" variant="raised">
		<div class="paper-content">
			<h1 class="type-headline3">Profile</h1>
			{#if $walletConnected}
				<Chip label="Address" value={$walletAddress || ''} />
				<h2 class="domains type-headline4">Domains</h2>
				<Textfield
					class="my-1 search-bar"
					label="Search"
					bind:value={search}
					variant="outlined"
					withTrailingIcon
				>
					<svelte:fragment slot="trailingIcon">
						<div class="close-icon">
							<IconButton on:click={cleanSearch} aria-label="cancel">
								<Icon icon="cancel" />
							</IconButton>
						</div>
					</svelte:fragment>
				</Textfield>
				<DomainsTable domains={domainsFiltered} {loaded} />
			{:else}
				<p>Connect your wallet to see your domains</p>
			{/if}
		</div>
	</Paper>
</div>

<style lang="scss">
	.domains {
		margin-top: 1.5rem;
		margin-bottom: 0;
	}

	h1 {
		margin-bottom: 1rem;
	}

	:global(.search-bar) {
		height: 48px;
		min-width: 50%;
	}

	.close-icon {
		align-self: center;
		opacity: 0.7;
	}

	.profile {
		width: 70vw;
		margin: 2rem auto;
	}

	.paper-content {
		padding: 1rem;
		text-align: center;
	}

	@media screen and (max-width: 768px) {
		.profile {
			width: 90vw;
		}
	}

	h1 {
		margin-top: 0;
	}
</style>
