<script lang="ts">
	import { alertMessage, walletAddress, walletConnected } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { connectMetaMask, connectPartisia, getAddress } from '$lib/wallet';

	import List, { Item, Text } from '@smui/list';
	import Menu from '@smui/menu';

	import metamaskLogo from '$lib/assets/images/metamask.svg'
	import partisiaWalletLogo from '$lib/assets/images/partisia-wallet.svg'

	import 'src/styles/wallet-connect.scss';
	import Button from '@smui/button';

	let menu: Menu;
	let toggleOpen = false;

	async function connectWithMetaMaskWallet() {
		try {
			const metamask = await connectMetaMask();

			$metaNamesSdk.setSigningStrategy('MetaMask', metamask);

			const address = await getAddress(metamask);
			walletAddress.set(address);
		} catch (e) {
			alertMessage.set("Couldn't connect to MetaMask wallet");
			console.log(e);
		}
	}

	async function connectWithPartisiaWallet() {
		try {
			const client = await connectPartisia();
			if (!client.connection) throw new Error('Connection failed');

			$metaNamesSdk.setSigningStrategy('partisiaSdk', client);

			const address = await getAddress(client);
			walletAddress.set(address);
		} catch (e) {
			alertMessage.set("Couldn't connect to Partisia wallet");
			console.log(e);
		}
	}

	function disconnectWallet() {
		walletAddress.set(undefined);
		$metaNamesSdk.resetSigningStrategy();

		return true;
	}

	function toggleMenu() {
		toggleOpen = !toggleOpen;
		menu.setOpen(toggleOpen);
	}

	export let anchor: HTMLDivElement;
	export let connectButtonVariant: 'raised' | 'unelevated' | 'outlined' = 'raised';
</script>

<Button variant={connectButtonVariant} on:click={toggleMenu}>
	<slot name="buttonLabel">Connect</slot>
</Button>
<Menu
	bind:this={menu}
	on:SMUIMenuSurface:closed={() => (toggleOpen = false)}
	class="menu-floating-right"
	anchor={true}
	bind:anchorElement={anchor}
	anchorCorner="BOTTOM_LEFT"
>
	<List>
		{#if $walletConnected}
			<slot name="connectedMenuIems" />
			<Item on:SMUI:action={() => disconnectWallet() && toggleMenu()}>
				<Text>Disconnect</Text>
			</Item>
		{:else}
			<Item on:SMUI:action={connectWithMetaMaskWallet}>
				<Text>
					<div class="item">
						<img class="logo" src={metamaskLogo} alt="metamask wallet logo" />
						<span>Meta Mask Wallet</span>
					</div>
				</Text>
			</Item>
			<Item on:SMUI:action={connectWithPartisiaWallet}>
				<Text>
					<div class="item">
						<img class="logo" src={partisiaWalletLogo} alt="partisia wallet logo" />
						<span>Partisia Wallet</span>
					</div>
				</Text>
			</Item>
		{/if}
	</List>
</Menu>

<style lang="scss">
	.logo {
		height: 20pt;
		width: 20pt;
		margin-right: 0.8rem;
	}

	.item {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
</style>
