<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue, Pagination } from '@smui/data-table';
	import Icon from 'src/components/Icon.svelte';
	import LinearProgress from '@smui/linear-progress';
	import Select, { Option } from '@smui/select';
	import Button from '@smui/button';
	import IconButton from '@smui/icon-button';

	export let domains: Domain[] = [];
	export let loaded = false;

	let sort: keyof Domain = 'tokenId';
	let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
	let rowsPerPage = 5;
	let currentPage = 0;

	$: domainsLength = domains.length;
	$: start = currentPage * rowsPerPage;
	$: end = Math.min(start + rowsPerPage, domainsLength);
	$: slice = domains.slice(start, end);
	$: lastPage = Math.max(Math.ceil(domainsLength / rowsPerPage) - 1, 0);
	$: if (currentPage > lastPage) {
		currentPage = lastPage;
	}
	$: if (domainsLength > 0) {
		handleSort();
	}

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
</script>

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
				<IconButton aria-label="sort-by-token">
					<Icon icon="arrow-upward" />
				</IconButton>
				<Label>Token ID</Label>
			</Cell>
			<Cell class="w-80" columnId="name">
				<Label>Domain Name</Label>
				<IconButton aria-label="sort-by-name">
					<Icon icon="arrow-upward" />
				</IconButton>
			</Cell>
			<Cell columnId="parentId" sortable={false}>
				<Label>Parent Name</Label>
			</Cell>
		</Row>
	</Head>
	{#if loaded}
		{#if domainsLength > 0}
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
		{:else if domainsLength === 0}
			<Body>
				<Row>
					<Cell colspan={3}>
						<div class="flex-content py-1">
							<p>No domains found</p>
							<Button href="/" variant="raised">Register a domain</Button>
						</div>
					</Cell>
				</Row>
			</Body>
		{/if}
	{/if}
	<Pagination slot="paginate">
		<svelte:fragment slot="rowsPerPage">
			<Label>Rows Per Page</Label>
			<Select variant="outlined" bind:value={rowsPerPage} noLabel>
				<Option value={5}>5</Option>
				<Option value={10}>10</Option>
				<Option value={20}>20</Option>
				<Option value={domainsLength}>Max</Option>
			</Select>
		</svelte:fragment>
		<svelte:fragment slot="total">
			{start + 1}-{end} of {domainsLength}
		</svelte:fragment>

		<IconButton
			action="first-page"
			title="First page"
			on:click={() => (currentPage = 0)}
			disabled={currentPage === 0}
			aria-label="first page"
		>
			<Icon icon="first-page" />
		</IconButton>
		<IconButton
			action="prev-page"
			title="Prev page"
			on:click={() => currentPage--}
			disabled={currentPage === 0}
			aria-label="previous page"
		>
			<Icon icon="chevron-left" />
		</IconButton>
		<IconButton
			action="next-page"
			title="Next page"
			on:click={() => currentPage++}
			disabled={currentPage === lastPage}
			aria-label="next page"
		>
			<Icon icon="chevron-right" />
		</IconButton>
		<IconButton
			action="last-page"
			title="Last page"
			on:click={() => (currentPage = lastPage)}
			disabled={currentPage === lastPage}
			aria-label="last page"
		>
			<Icon icon="last-page" />
		</IconButton>
	</Pagination>
	<LinearProgress
		closed={loaded}
		indeterminate
		aria-label="Data is being loaded..."
		slot="progress"
	/>
</DataTable>
