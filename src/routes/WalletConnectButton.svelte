<script lang="ts">
	import { alertMessage, walletAddress, walletConnected } from '$lib/stores/main';

	import List, { Item, Text } from '@smui/list';
	import Menu from '@smui/menu';

	import metamaskLogo from '$lib/assets/images/metamask.png';
	import partisiaWalletLogo from '$lib/assets/images/partisia-wallet.png';
	import ledgerWalletLogo from '$lib/assets/images/ledger-wallet-white.png';

	import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
	import { PartisiaLedgerClient } from '@metanames/sdk/dist/transactions/ledger';

	import 'src/styles/wallet-connect.scss';
	import Button from '@smui/button';

	let menu: Menu;
	let toggleOpen = false;

	async function connectWithMetaMaskWallet() {
		const { metaNamesSdk } = await import('$lib/stores/sdk');
		const { connectMetaMask, getAddress } = await import('$lib/wallet');
		try {
			const metamask = await connectMetaMask();

			metaNamesSdk.update((sdk) => {
				sdk.setSigningStrategy('MetaMask', metamask);
				return sdk;
			});

			const address = await getAddress(metamask);
			walletAddress.set(address);
		} catch (e) {
			alertMessage.set("Couldn't connect to MetaMask wallet");
			console.log(e);
		}
	}

	async function connectWithLedgerWallet() {
		const { metaNamesSdk } = await import('$lib/stores/sdk');
		try {
			const transport = await TransportWebUSB.create();

			metaNamesSdk.update((sdk) => {
				sdk.setSigningStrategy('Ledger', transport);
				return sdk;
			});

			const client = new PartisiaLedgerClient(transport);
			const address = await client.getAddress();
			walletAddress.set(address);
		} catch (e) {
			alertMessage.set("Couldn't connect to Ledger wallet");
			console.log(e);
		}
	}

	async function connectWithPartisiaWallet() {
		const { metaNamesSdk } = await import('$lib/stores/sdk');
		const { connectPartisia, getAddress } = await import('$lib/wallet');
		try {
			const client = await connectPartisia();
			if (!client.connection) throw new Error('Connection failed');

			metaNamesSdk.update((sdk) => {
				// @ts-ignore
				sdk.setSigningStrategy('partisiaSdk', client);
				return sdk;
			});

			const address = await getAddress(client);
			walletAddress.set(address);
		} catch (e) {
			alertMessage.set("Couldn't connect to Partisia wallet");
			console.log(e);
		}
	}

	async function disconnectWallet() {
		const { metaNamesSdk } = await import('$lib/stores/sdk');

		walletAddress.set(undefined);
		metaNamesSdk.update((sdk) => {
			sdk.resetSigningStrategy();
			return sdk;
		});

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
			<Item on:SMUI:action={async () => disconnectWallet().then(toggleMenu)}>
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
			<Item on:SMUI:action={connectWithLedgerWallet}>
				<Text>
					<div class="item">
						<img class="logo" src={ledgerWalletLogo} alt="ledger wallet logo" />
						<span>Ledger</span>
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
