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
	import Button from '@smui/button';

	let menu: Menu;
	let toggleOpen = false;
	let devPrivateKey = '';

	$: isTestnet = config.environment === 'test';

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
			toggleMenu();
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

		devPrivateKey = '';
		return true;
	}

	function toggleMenu() {
		toggleOpen = !toggleOpen;
		menu.setOpen(toggleOpen);
	}

	export let anchor: HTMLDivElement;
	export let connectButtonVariant: 'raised' | 'unelevated' | 'outlined' = 'raised';
	export let testid: string = '';
</script>

<Button variant={connectButtonVariant} onclick={toggleMenu} data-testid={testid}>
	<slot name="buttonLabel">Connect</slot>
</Button>
<Menu
	bind:this={menu}
	onSMUIMenuSurfaceClosed={() => {
		toggleOpen = false;
	}}
	class="menu-floating-right"
	bind:anchorElement={anchor}
	anchorCorner="BOTTOM_LEFT"
>
	<List>
		{#if $walletConnected}
			<slot name="connectedMenuIems" />
			<Item onSMUIAction={async () => disconnectWallet().then(toggleMenu)}>
				<Text>Disconnect</Text>
			</Item>
		{:else}
			<Item onSMUIAction={connectWithMetaMaskWallet}>
				<Text>
					<div class="item">
						<img class="logo" src={metamaskLogo} alt="metamask wallet logo" />
						<span>Meta Mask Wallet</span>
					</div>
				</Text>
			</Item>
			<Item onSMUIAction={connectWithPartisiaWallet}>
				<Text>
					<div class="item">
						<img class="logo" src={partisiaWalletLogo} alt="partisia wallet logo" />
						<span>Partisia Wallet</span>
					</div>
				</Text>
			</Item>
			<Item onSMUIAction={connectWithLedgerWallet}>
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
						<input
							class="dev-key-input"
							type="password"
							placeholder="Private key (64 hex chars)..."
							bind:value={devPrivateKey}
							on:keydown={(e) => e.key === 'Enter' && connectWithPrivateKey()}
							on:click|stopPropagation
							on:keydown|stopPropagation
						/>
						<button
							class="dev-key-connect"
							on:click|stopPropagation={connectWithPrivateKey}
							disabled={devPrivateKey.length !== 64}
						>
							Connect
						</button>
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

	.dev-key-input {
		flex: 1;
		padding: 0.4rem 0.5rem;
		border: 1px solid #555;
		border-radius: 0.25rem;
		background: #1a1a2e;
		color: white;
		font-family: monospace;
		font-size: 0.75rem;
		min-width: 180px;

		&::placeholder {
			color: #777;
		}
	}

	.dev-key-connect {
		padding: 0.4rem 0.75rem;
		background: #4ecdc4;
		color: #1a1a2e;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: bold;
		font-size: 0.75rem;
		white-space: nowrap;

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}
</style>
