<script lang="ts">
	import type { Domain } from '@metanames/sdk';

	import SvelteTable from 'svelte-table';
	import { metaNamesSdkAuthenticated, walletClient, walletConnected } from '$lib/stores';

	import CircularProgress from '@smui/circular-progress';
	import Paper from '@smui/paper';

	$: walletAddress = $walletClient?.connection?.account.address;

	const columns = [
		{
			key: 'name',
			title: 'Domain Name',
			sortable: true,
			parseHTML: true,
			value: (row: Domain) => row.name,
			renderValue: (row: Domain) => {
				return `<a href="/domain/${row.name}">${row.name}</a>`;
			}
		},
		{
			key: 'parentId',
			title: 'Parent',
			sortable: true,
			parseHTML: true,
			value: (row: Domain) => row.parentId ?? '',
			renderValue: (row: Domain) => {
				if (row.parentId) {
					return `<a href="/domain/${row.parentId}">${row.parentId}</a>`;
				} else {
					return '';
				}
			}
		},
		{
			key: 'tokenId',
			title: 'Token ID',
			sortable: true,
			value: (row: Domain) => row.tokenId
		}
	];

	async function getDomains(walletAddress: string | undefined) {
		if (!walletAddress) return [];

		const domains: Domain[] = await $metaNamesSdkAuthenticated?.domainRepository?.findByOwner(
			walletAddress
		);
		if (domains) return domains;
		else return [];
	}
</script>

<div class="profile content">
	<Paper class="w-100" variant="raised">
		<div class="paper-content">
			{#if $walletConnected}
				<h3>Profile</h3>
				<p class="address-title">Wallet address</p>
				<p>{walletAddress}</p>
				<h4>Domains</h4>
				{#await getDomains(walletAddress)}
					<CircularProgress style="height: 32px; width: 32px;" indeterminate />
				{:then domains}
					{#if domains.length === 0}
						<p>No domains found</p>
						<a href="/">Register a domain!</a>
					{:else}
						<SvelteTable {columns} rows={domains} />
					{/if}
				{/await}
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
