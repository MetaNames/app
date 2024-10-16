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

		if (trimmedDomain.startsWith(trimmedSearch) || trimmedDomain.includes(trimmedSearch))
			return true;
		else false;
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
					class="my-1"
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

	h3 {
		margin-bottom: 1rem;
	}
	.close-icon {
		align-self: center;
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
