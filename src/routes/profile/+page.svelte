<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import { walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';

	import Paper from '@smui/paper';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue, Pagination } from '@smui/data-table';
	import IconButton from '@smui/icon-button';
	import LinearProgress from '@smui/linear-progress';
	import Button from '@smui/button/src/Button.svelte';
	import Select, { Option } from '@smui/select';

	let domains: Domain[] = [];
	let sort: keyof Domain = 'tokenId';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let rowsPerPage = 5;
	let currentPage = 0;

	$: start = currentPage * rowsPerPage;
	$: end = Math.min(start + rowsPerPage, domains.length);
	$: slice = domains.slice(start, end);
	$: lastPage = Math.max(Math.ceil(domains.length / rowsPerPage) - 1, 0);
	$: if (currentPage > lastPage) {
		currentPage = lastPage;
	}

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
			<h3>My Domains</h3>
			{#if $walletConnected}
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
							{#each slice as domain (domain.tokenId)}
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
					<Pagination slot="paginate">
						<svelte:fragment slot="rowsPerPage">
							<Label>Rows Per Page</Label>
							<Select variant="outlined" bind:value={rowsPerPage} noLabel>
								<Option value={5}>5</Option>
								<Option value={10}>10</Option>
								<Option value={20}>20</Option>
							</Select>
						</svelte:fragment>
						<svelte:fragment slot="total">
							{start + 1}-{end} of {domains.length}
						</svelte:fragment>

						<IconButton
							class="material-icons"
							action="first-page"
							title="First page"
							on:click={() => (currentPage = 0)}
							disabled={currentPage === 0}>first_page</IconButton
						>
						<IconButton
							class="material-icons"
							action="prev-page"
							title="Prev page"
							on:click={() => currentPage--}
							disabled={currentPage === 0}>chevron_left</IconButton
						>
						<IconButton
							class="material-icons"
							action="next-page"
							title="Next page"
							on:click={() => currentPage++}
							disabled={currentPage === lastPage}>chevron_right</IconButton
						>
						<IconButton
							class="material-icons"
							action="last-page"
							title="Last page"
							on:click={() => (currentPage = lastPage)}
							disabled={currentPage === lastPage}>last_page</IconButton
						>
					</Pagination>
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
