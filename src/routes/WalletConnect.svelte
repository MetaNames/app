<script lang="ts">
	import { connection } from '$lib/stores';
	import { connect } from '$lib/wallet';
	import Button, { Label, Icon } from '@smui/button';
	import { derived } from 'svelte/store';

	const shortAddress = derived(connection, ($connection) => {
		if ($connection) {
			const address = $connection.connection.account.address;
			return address.slice(0, 4) + '...' + address.slice(-4);
		}
	});

	async function connectWallet() {
		const conn = await connect();
		connection.set(conn);
	}

	function disconnectWallet() {
		connection.set(null);
	}
</script>

{#if $shortAddress}
	<Button on:click={disconnectWallet}>
		<Icon class="material-icons" aria-label="Wallet">wallet</Icon>
		<Label>{$shortAddress}</Label>
	</Button>
{:else}
	<Button on:click={connectWallet}>
		<Icon class="material-icons" aria-label="Wallet">wallet</Icon>
		<Label>Connect Wallet</Label>
	</Button>
{/if}
