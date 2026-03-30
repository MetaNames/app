<script lang="ts">
	import { alertMessage, walletAddress, walletConnected } from '$lib/stores/main';
	import { config } from '$lib';

	import List, { Item, Separator, Text } from '@smui/list';
	import Menu from '@smui/menu';

	import metamaskLogo from '$lib/assets/images/metamask.png';
	import partisiaWalletLogo from '$lib/assets/images/partisia-wallet.png';
	import ledgerWalletLogo from '$lib/assets/images/ledger-wallet-white.png';

	import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
	import { PartisiaLedgerClient } from '@metanames/sdk/dist/transactions/ledger';

	import 'src/styles/wallet-connect.scss';
	import Button, { Label } from '@smui/button';
	import Textfield from '@smui/textfield';

	let menu: Menu | undefined;
	let toggleOpen = false;
	let devPrivateKey = '';

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

	async function connectWithPrivateKey() {
		if (!devPrivateKey || devPrivateKey.length !== 64) return;

		const { metaNamesSdk } = await import('$lib/stores/sdk');
		try {
			const { privateKeyToAccountAddress } =
				await import('partisia-blockchain-applications-crypto/lib/main/wallet');
			const address = await privateKeyToAccountAddress(devPrivateKey);
			if (!address) {
				alertMessage.set('Invalid private key');
				return;
			}

			metaNamesSdk.update((sdk) => {
				sdk.setSigningStrategy('privateKey', devPrivateKey);
				return sdk;
			});

			walletAddress.set(address);
			devPrivateKey = '';
		} catch (e) {
			alertMessage.set("Couldn't connect with private key");
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
		menu?.setOpen(toggleOpen);
	}

	function handleKeydown(e: Event) {
		if (e instanceof KeyboardEvent && e.key === 'Enter') connectWithPrivateKey();
	}

	let isTestnet = config.environment === 'test';

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
						<img class="logo" src={ledgerWalletLogo} alt="partisia wallet logo" />
						<span>Ledger</span>
					</div>
				</Text>
			</Item>
			{#if isTestnet && toggleOpen}
				<Separator />
				<li class="dev-key-section">
					<div class="dev-key-label">
						<span class="dev-emoji">🐷</span>
						<span>Dev Private Key</span>
					</div>
					<div class="dev-key-input-row">
						<Textfield
							class="dev-key-input"
							type="password"
							placeholder="Private key (64 hex chars)..."
							bind:value={devPrivateKey}
							onkeydown={(e) => {
								e.stopPropagation();
								handleKeydown(e);
							}}
							onclick={(e) => e.stopPropagation()}
							variant="outlined"
						/>
						<Button
							class="dev-key-connect"
							variant="raised"
							onclick={(e) => {
								e.stopPropagation();
								connectWithPrivateKey();
							}}
							disabled={devPrivateKey.length !== 64}
						>
							<Label>Connect</Label>
						</Button>
					</div>
				</li>
			{/if}
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

	.dev-key-section {
		padding: 0.5rem 1rem;
		list-style: none;
	}

	.dev-key-label {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.dev-emoji {
		font-size: 12pt;
		margin-right: 0.5rem;
		display: inline-flex;
		align-items: center;
	}

	.dev-key-input-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>
