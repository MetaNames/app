<script lang="ts">
	import { metaNamesSdkAuthenticated, walletAddress } from '$lib/stores';
	import { connectMetaMask, connectPartisia, getAddress } from '$lib/wallet';
	import { derived } from 'svelte/store';

	import Button, { Icon, Label } from '@smui/button';
	import List, { Item, Text } from '@smui/list';
	import Menu from '@smui/menu';

	import { metaNamesSdkFactory } from '$lib';
	import '../styles/wallet-connect.scss';
	import { goto } from '$app/navigation';

	const shortAddress = derived(walletAddress, ($address) => {
		if ($address) return $address.slice(0, 4) + '...' + $address.slice(-4);
	});

	$: buttonLabel = $shortAddress ? $shortAddress : 'Connect Wallet';

	async function connectWithMetaMaskWallet() {
		const metamask = await connectMetaMask();

		const sdk = metaNamesSdkFactory();
		sdk.setSigningStrategy('MetaMask', metamask);
		metaNamesSdkAuthenticated.set(sdk);

		const address = await getAddress(metamask);
		walletAddress.set(address);
	}

	async function connectWithPartisiaWallet() {
		const client = await connectPartisia();
		if (!client.connection) throw new Error('Connection failed');

		const address = await getAddress(client);
		walletAddress.set(address);

		const sdk = metaNamesSdkFactory();
		sdk.setSigningStrategy('partisiaSdk', client);
		metaNamesSdkAuthenticated.set(sdk);
	}

	function disconnectWallet() {
		walletAddress.set(undefined);
		metaNamesSdkAuthenticated.set(undefined);
	}

	let menu: Menu;

	export let anchor: HTMLDivElement;
</script>

<Button on:click={() => menu.setOpen(true)}>
	<Icon class="material-icons" aria-label="Wallet">wallet</Icon>
	<Label>{buttonLabel}</Label>
</Button>
<Menu
	bind:this={menu}
	class="menu-floating-right"
	anchor={false}
	bind:anchorElement={anchor}
	anchorCorner="BOTTOM_LEFT"
>
	<List>
		{#if $shortAddress}
			<Item on:SMUI:action={() => goto('/profile')}>
				<Text>Profile</Text>
			</Item>
			<Item on:SMUI:action={disconnectWallet}>
				<Text>Disconnect</Text>
			</Item>
		{:else}
			<Item on:SMUI:action={connectWithMetaMaskWallet}>
				<Text>Meta Mask Wallet</Text>
			</Item>
			<Item on:SMUI:action={connectWithPartisiaWallet}>
				<Text>Partisia Wallet</Text>
			</Item>
		{/if}
	</List>
</Menu>
