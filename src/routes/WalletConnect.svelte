<script lang="ts">
	import { connection } from '$lib/stores';
	import { connect } from '$lib/wallet';
	import { derived } from 'svelte/store';

	import Button, { Label, Icon } from '@smui/button';
	import List, { Item, Text } from '@smui/list';
	import Menu from '@smui/menu';

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

	let menu: Menu;

	export let anchor: HTMLDivElement;
	export const closeMenu = () => {
		menu && menu.setOpen(false);
	};
</script>

{#if $shortAddress}
	<Button on:click={() => menu.setOpen(true)}>
		<Icon class="material-icons" aria-label="Wallet">wallet</Icon>
		<Label>{$shortAddress}</Label>
	</Button>
	<Menu
		bind:this={menu}
		class="menu-floating-right"
		anchor={false}
		bind:anchorElement={anchor}
		anchorCorner="BOTTOM_LEFT"
	>
		<List>
			<Item on:SMUI:action={disconnectWallet}>
				<Text>Disconnect</Text>
			</Item>
		</List>
	</Menu>
{:else}
	<Button on:click={connectWallet}>
		<Icon class="material-icons" aria-label="Wallet">wallet</Icon>
		<Label>Connect Wallet</Label>
	</Button>
{/if}

<style>
	/* Hack to make the menu appear on the right */
	:global(.menu-floating-right) {
		left: unset !important;
	}
</style>
