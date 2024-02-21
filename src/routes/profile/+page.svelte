<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import { walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';

	import Paper from '@smui/paper';
	import DomainsTable from './DomainsTable.svelte';

	let domains: Domain[] = []
	let loaded = false;

	walletAddress.subscribe(async (address) => {
		if (!address) return;

		loaded = false;
		domains = await $metaNamesSdk.domainRepository.findByOwner(address);
		console.log(domains)
		loaded = true;
	});
</script>

<div class="profile content">
	<Paper class="w-100" variant="raised">
		<div class="paper-content">
			<h3>My Domains</h3>
			{#if $walletConnected}
			<DomainsTable {domains} {loaded} />
			{:else}
				<p>Connect your wallet to see your domains</p>
			{/if}
		</div>
	</Paper>
</div>

<style lang="scss">
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
