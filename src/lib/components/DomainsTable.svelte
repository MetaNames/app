<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import Icon from '$lib/components/Icon.svelte';
	import LinearProgress from '$lib/components/LinearProgress.svelte';
	import Select from '$lib/components/Select.svelte';
	import Button from '$lib/components/Button.svelte';
	import IconButton from '$lib/components/IconButton.svelte';

	export let domains: Domain[] = [];
	export let loaded = false;

	let sort: keyof Domain = 'tokenId';
	let sortDirection: 'ascending' | 'descending' = 'ascending';
	let rowsPerPage = 5;
	let currentPage = 0;

	$: sortedDomains = [...domains].sort((a, b) => {
		const aVal = a[sort];
		const bVal = b[sort];
		const comparison = typeof aVal === 'string' && typeof bVal === 'string' 
			? aVal.localeCompare(bVal) 
			: Number(aVal) - Number(bVal);
		return sortDirection === 'ascending' ? comparison : -comparison;
	});

	$: domainsLength = sortedDomains.length;
	$: start = currentPage * rowsPerPage;
	$: end = Math.min(start + rowsPerPage, domainsLength);
	$: slice = sortedDomains.slice(start, end);
	$: lastPage = Math.max(Math.ceil(domainsLength / rowsPerPage) - 1, 0);

	$: if (currentPage > lastPage) {
		currentPage = lastPage;
	}

	function handleSort(column: keyof Domain) {
		if (sort === column) {
			sortDirection = sortDirection === 'ascending' ? 'descending' : 'ascending';
		} else {
			sort = column;
			sortDirection = 'ascending';
		}
	}

	function handleFirstPage() {
		currentPage = 0;
	}

	function handlePrevPage() {
		if (currentPage > 0) currentPage--;
	}

	function handleNextPage() {
		if (currentPage < lastPage) currentPage++;
	}

	function handleLastPage() {
		currentPage = lastPage;
	}
</script>

<div class="data-table-container">
	<LinearProgress closed={loaded} indeterminate ariaLabel="Data is being loaded..." />

	<table class="data-table" aria-label="Domain list">
		<thead>
			<tr>
				<th class="numeric" on:click={() => handleSort('tokenId')}>
					<div class="th-content">
						<span>Token ID</span>
						<IconButton ariaLabel="sort-by-token" size="small">
							<Icon icon={sort === 'tokenId' ? (sortDirection === 'ascending' ? 'arrow-upward' : 'arrow-downward') : 'arrow-upward'} />
						</IconButton>
					</div>
				</th>
				<th class="w-80" on:click={() => handleSort('name')}>
					<div class="th-content">
						<span>Domain Name</span>
						<IconButton ariaLabel="sort-by-name" size="small">
							<Icon icon={sort === 'name' ? (sortDirection === 'ascending' ? 'arrow-upward' : 'arrow-downward') : 'arrow-upward'} />
						</IconButton>
					</div>
				</th>
				<th>
					<div class="th-content">
						<span>Parent Name</span>
					</div>
				</th>
			</tr>
		</thead>
		{#if loaded}
			{#if domainsLength > 0}
				<tbody>
					{#each slice as domain (domain.tokenId)}
						<tr>
							<td class="numeric">{domain.tokenId}</td>
							<td>
								<a href="/domain/{domain.name}">{domain.name}</a>
							</td>
							<td>
								{#if domain.parentId}
									<a href="/domain/{domain.parentId}">{domain.parentId}</a>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			{:else if domainsLength === 0}
				<tbody>
					<tr>
						<td colspan={3}>
							<div class="empty-content">
								<p>No domains found</p>
								<Button href="/" variant="raised">Register a domain</Button>
							</div>
						</td>
					</tr>
				</tbody>
			{/if}
		{/if}
	</table>

	{#if loaded && domainsLength > 0}
		<div class="pagination">
			<div class="rows-per-page">
				<label for="rows-select">Rows Per Page</label>
				<Select bind:value={rowsPerPage} noLabel id="rows-select">
					<option value={5}>5</option>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={domainsLength}>Max</option>
				</Select>
			</div>
			<div class="page-info">
				{start + 1}-{end} of {domainsLength}
			</div>
			<div class="page-controls">
				<IconButton
					ariaLabel="First page"
					on:click={handleFirstPage}
					disabled={currentPage === 0}
				>
					<Icon icon="first-page" />
				</IconButton>
				<IconButton
					ariaLabel="Previous page"
					on:click={handlePrevPage}
					disabled={currentPage === 0}
				>
					<Icon icon="chevron-left" />
				</IconButton>
				<IconButton
					ariaLabel="Next page"
					on:click={handleNextPage}
					disabled={currentPage === lastPage}
				>
					<Icon icon="chevron-right" />
				</IconButton>
				<IconButton
					ariaLabel="Last page"
					on:click={handleLastPage}
					disabled={currentPage === lastPage}
				>
					<Icon icon="last-page" />
				</IconButton>
			</div>
		</div>
	{/if}
</div>

<style>
	.data-table-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 12px;
		overflow: hidden;
	}

	.data-table th,
	.data-table td {
		padding: 12px 16px;
		text-align: left;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.data-table th {
		background: rgba(255, 255, 255, 0.05);
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		cursor: pointer;
		user-select: none;
		transition: background 0.2s ease;
	}

	.data-table th:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.th-content {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.data-table td {
		color: rgba(255, 255, 255, 0.9);
	}

	.data-table td a {
		color: #6849fe;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.data-table td a:hover {
		color: #8b5cf6;
		text-decoration: underline;
	}

	.data-table tbody tr {
		transition: background 0.2s ease;
	}

	.data-table tbody tr:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.numeric {
		text-align: right;
	}

	.w-80 {
		width: 80%;
	}

	.empty-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 32px;
		color: rgba(255, 255, 255, 0.6);
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
		flex-wrap: wrap;
		gap: 16px;
	}

	.rows-per-page {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.rows-per-page label {
		color: rgba(255, 255, 255, 0.7);
		font-size: 14px;
	}

	.page-info {
		color: rgba(255, 255, 255, 0.7);
		font-size: 14px;
	}

	.page-controls {
		display: flex;
		gap: 4px;
	}
</style>
