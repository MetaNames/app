<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import { walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';

	import Paper from '@smui/paper';
	import DomainsTable from './DomainsTable.svelte';
	import Textfield from '@smui/textfield';
	import IconButton from '@smui/icon-button';

	let domains: Domain[] = [];
	let domainsFiltered: Domain[] = [];
	let loaded = false;
	let search = '';

	$: if (search !== '') {
		domainsFiltered = domains.filter((domain) =>
			domain.name.toLowerCase().includes(search.toLowerCase())
		);
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
</script>

<div class="profile content">
	<Paper class="w-100" variant="raised">
		<div class="paper-content">
			<h3>My Domains</h3>
			{#if $walletConnected}
				<Textfield
					class="my-1"
					label="Search"
					bind:value={search}
					variant="outlined"
					withTrailingIcon
				>
					<svelte:fragment slot="trailingIcon">
						<div class="close-icon">
							<IconButton class="material-icons" on:click={cleanSearch}>cancel</IconButton>
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
