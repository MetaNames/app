<script lang="ts">
	import { metaNamesSdkAuthenticated, walletClient } from '$lib/stores';
	import { connect } from '$lib/wallet';
	import { derived } from 'svelte/store';

	import Button, { Icon, Label } from '@smui/button';
	import List, { Item, Text } from '@smui/list';
	import Menu from '@smui/menu';

	import { metaNamesSdkFactory } from '$lib';
	import '../styles/wallet-connect.scss';
	import { goto } from '$app/navigation';

	const shortAddress = derived(walletClient, ($client) => {
		if ($client?.connection) {
			const address = $client.connection.account.address;
			return address.slice(0, 4) + '...' + address.slice(-4);
		}
	});

	async function connectWallet() {
		const client = await connect();
		walletClient.set(client);

		const sdk = metaNamesSdkFactory();
		sdk.setSigningStrategy('partisiaSdk', client);
		metaNamesSdkAuthenticated.set(sdk);
	}

	function disconnectWallet() {
		walletClient.set(null);
		metaNamesSdkAuthenticated.set(null);
	}

	let menu: Menu;

	export let anchor: HTMLDivElement;
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
			<Item on:SMUI:action={() => goto('/profile')}>
				<Text>Profile</Text>
			</Item>
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
