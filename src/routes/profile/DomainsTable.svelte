<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import DataTable, { Head, Body, Row, Cell, Label, SortValue, Pagination } from '@smui/data-table';
	import Icon from 'src/components/Icon.svelte';
	import LinearProgress from '@smui/linear-progress';
	import Select, { Option } from '@smui/select';
	import Button from '@smui/button';
	import IconButton from '@smui/icon-button';

	interface Props {
		domains?: Domain[];
		loaded?: boolean;
	}

	let { domains = $bindable([]), loaded = false }: Props = $props();

	let sort: keyof Domain = $state('tokenId');
	let sortDirection: Lowercase<keyof typeof SortValue> = $state('ascending');
	let rowsPerPage = $state(5);
	let currentPage = $state(0);

	function handleSort() {
		domains.sort((a, b) => {
			const [aVal, bVal] = [a[sort], b[sort]][
				sortDirection === 'ascending' ? 'slice' : 'reverse'
			]();
			if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal);
			return Number(aVal) - Number(bVal);
		});
	}
	let domainsLength = $derived(domains.length);
	let lastPage = $derived(Math.max(Math.ceil(domainsLength / rowsPerPage) - 1, 0));
	$effect(() => {
		if (currentPage > lastPage) {
			currentPage = lastPage;
		}
	});
	let start = $derived(currentPage * rowsPerPage);
	let end = $derived(Math.min(start + rowsPerPage, domainsLength));
	let slice = $derived(domains.slice(start, end));
	$effect(() => {
		if (domainsLength > 0) {
			handleSort();
		}
	});
</script>

<DataTable
	sortable
	bind:sort
	bind:sortDirection
	onSMUIDataTableSorted={handleSort}
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
	{#snippet paginate()}
		<Pagination>
			{#snippet rowsPerPageSelect()}
				<Label>Rows Per Page</Label>
				<Select variant="outlined" bind:value={rowsPerPage} noLabel>
					<Option value={5}>5</Option>
					<Option value={10}>10</Option>
					<Option value={20}>20</Option>
					<Option value={domainsLength}>Max</Option>
				</Select>
			{/snippet}
			{#snippet total()}
				{start + 1}-{end} of {domainsLength}
			{/snippet}

			<IconButton
				action="first-page"
				title="First page"
				onclick={() => (currentPage = 0)}
				disabled={currentPage === 0}
				aria-label="first page"
			>
				<Icon icon="first-page" />
			</IconButton>
			<IconButton
				action="prev-page"
				title="Prev page"
				onclick={() => currentPage--}
				disabled={currentPage === 0}
				aria-label="previous page"
			>
				<Icon icon="chevron-left" />
			</IconButton>
			<IconButton
				action="next-page"
				title="Next page"
				onclick={() => currentPage++}
				disabled={currentPage === lastPage}
				aria-label="next page"
			>
				<Icon icon="chevron-right" />
			</IconButton>
			<IconButton
				action="last-page"
				title="Last page"
				onclick={() => (currentPage = lastPage)}
				disabled={currentPage === lastPage}
				aria-label="last page"
			>
				<Icon icon="last-page" />
			</IconButton>
		</Pagination>
	{/snippet}
	{#snippet progress()}
		<LinearProgress closed={loaded} indeterminate aria-label="Data is being loaded..." />
	{/snippet}
</DataTable>
