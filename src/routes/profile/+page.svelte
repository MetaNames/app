<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import { walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';

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

	$: if (search !== '') {
		domainsFiltered = domains.filter((domain) => isFuzzyMatch(domain.name, search));
	}

	walletAddress.subscribe(async (address) => {
		if (!address) return;

		loaded = false;
		domains = await $metaNamesSdk.domainRepository.findByOwner(address);
		domainsFiltered = domains;
		loaded = true;
	});

	function cleanSearch() {
		search = '';
		domainsFiltered = domains;
	}

	function isFuzzyMatch(domain: string, search: string) {
		const trimmedDomain = domain.trim().toLowerCase();
		const trimmedSearch = search.trim().toLowerCase();

		return trimmedDomain.startsWith(trimmedSearch) || trimmedDomain.includes(trimmedSearch);
	}
</script>

<div class="profile content">
	<Paper class="w-100" variant="raised">
		<div class="paper-content">
			<h3>Profile</h3>
			{#if $walletConnected}
				<Chip label="Address" value={$walletAddress || ''} />
				<h4 class="domains">Domains</h4>
				<Textfield
					class="my-1 search-bar"
					label="Search"
					bind:value={search}
					variant="outlined"
					withTrailingIcon
				>
					<svelte:fragment slot="trailingIcon">
						<div class="close-icon">
							{#if search !== ''}
								<IconButton on:click={cleanSearch} aria-label="clear search">
									<Icon icon="cancel" />
								</IconButton>
							{:else}
								<IconButton aria-label="search domains" disabled>
									<Icon icon="search" />
								</IconButton>
							{/if}
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

	h3 {
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

	h3 {
		margin-top: 0;
	}
</style>
