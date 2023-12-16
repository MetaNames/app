<script lang="ts">
	import type { Domain } from '@metanames/sdk';

	import { metaNamesSdk, walletAddress, walletConnected } from '$lib/stores';

	import Paper from '@smui/paper';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import LinearProgress from '@smui/linear-progress';
	import Button from '@smui/button/src/Button.svelte';

	let domains: Domain[] = [];
	let sort: keyof Domain = 'tokenId';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';

	let loaded = false;

	function handleSort() {
		domains.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]();
			if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal);
			return Number(aVal) - Number(bVal);
		});
		domains = domains;
	}

	async function getDomains(walletAddress?: string) {
		if (!walletAddress) return [];

		loaded = false;
		const domains = await $metaNamesSdk.domainRepository.findByOwner(walletAddress);
		loaded = true;

		return domains;
	}

	walletAddress.subscribe(async (address) => {
		domains = await getDomains(address);
		handleSort();
	});
</script>

<div class="profile content">
	<Paper class="w-100" variant="raised">
		<div class="paper-content">
			{#if $walletConnected}
				<h3>Profile</h3>
				<p class="address-title">Wallet address</p>
				<p>{$walletAddress}</p>
				<h4>Domains</h4>
				<DataTable
					sortable
					bind:sort
					bind:sortDirection
					on:SMUIDataTable:sorted={handleSort}
					table$aria-label="Domain list"
					class="w-100"
				>
					<Head>
						<Row>
							<Cell numeric columnId="tokenId">
								<IconButton class="material-icons">arrow_upward</IconButton>
								<Label>Token ID</Label>
							</Cell>
							<Cell class="w-80" columnId="name">
								<Label>Domain Name</Label>
								<IconButton class="material-icons">arrow_upward</IconButton>
							</Cell>
							<Cell columnId="parentId" sortable={false}>
								<Label>Parent Name</Label>
							</Cell>
						</Row>
					</Head>
					{#if loaded && domains.length > 0}
						<Body>
							{#each domains as domain (domain.tokenId)}
								<Row>
									<Cell numeric>{domain.tokenId}</Cell>
									<Cell>
										<a href="/domain/{domain.name}">{domain.name}</a>
									</Cell>
									<Cell>
										{#if domain.parentId}
											<a href="/domain/{domain.parentId}">{domain.parentId}</a>
										{/if}
									</Cell>
								</Row>
							{/each}
						</Body>
					{/if}
					<LinearProgress
						closed={loaded}
						indeterminate
						aria-label="Data is being loaded..."
						slot="progress"
					/>
				</DataTable>
				{#if loaded && domains.length === 0}
					<p>No domains found</p>
					<Button href="/" variant="raised">Register a domain</Button>
				{/if}
			{:else}
				<h3>Connect the Wallet</h3>
				<p>To see your domains</p>
			{/if}
		</div>
	</Paper>
</div>

<style lang="scss">
	.address-title {
		font-weight: bold;
	}

	.profile {
		min-width: 60vw;
	}

	.paper-content {
		padding: 1rem;
		text-align: center;
	}

	h3 {
		margin-top: 0;
	}
</style>
