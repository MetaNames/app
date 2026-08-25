<script lang="ts">
	import { walletAddress, walletConnected } from '$lib/stores/main';
	import { config } from '$lib';

	import List, { Item, Separator, Text } from '@smui/list';
	import Menu from '@smui/menu';

	import metamaskLogo from '$lib/assets/images/metamask.png';
	import partisiaWalletLogo from '$lib/assets/images/partisia-wallet.png';
	import ledgerWalletLogo from '$lib/assets/images/ledger-wallet-white.png';

	// Orchestration (dynamic SDK imports, signing strategy, address lookup, store
	// updates) lives in $lib/wallet-connect.ts so it can be unit-tested; this
	// component keeps only view concerns.
	import {
		WALLET_CONNECTORS,
		createPrivateKeyConnector,
		connectWallet,
		type PrivateKeyConnector
	} from '$lib/wallet-connect';

	import 'src/styles/wallet-connect.scss';
	import Button from '@smui/button';

	let menu: Menu;
	let toggleOpen = false;
	let devPrivateKey = '';

	// Guard so a double-click on a menu item (or Enter + click racing on the dev-key
	// input) cannot re-enter a connect flow while one is already in flight.
	let connecting = false;

	$: isTestnet = config.environment === 'test';

	function toggleMenu() {
		toggleOpen = !toggleOpen;
		menu.setOpen(toggleOpen);
	}

	async function connect(connector: Parameters<typeof connectWallet>[0]) {
		if (connecting) return;
		connecting = true;
		try {
			await connectWallet(connector);
		} finally {
			connecting = false;
		}
	}

	async function connectWithPrivateKey() {
		if (!devPrivateKey || devPrivateKey.length !== 64 || connecting) return;

		const connector: PrivateKeyConnector = createPrivateKeyConnector(devPrivateKey);
		connecting = true;
		try {
			// Silent: a failure's error context would carry the dev key. The deliberate
			// non-reporting decision lives in connectWallet's `silent` handling.
			const ok = await connectWallet(connector, { silent: true });
			if (!ok) return;

			devPrivateKey = '';
			toggleMenu();
		} finally {
			connecting = false;
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

	export let anchor: HTMLDivElement;
	export let connectButtonVariant: 'raised' | 'unelevated' | 'outlined' = 'raised';
	export let testid: string | undefined = undefined;
</script>

<Button variant={connectButtonVariant} on:click={toggleMenu} data-testid={testid}>
	<slot name="buttonLabel">Connect</slot>
</Button>
<Menu
	bind:this={menu}
	on:SMUIMenuSurface:closed={() => {
		toggleOpen = false;
	}}
	class="menu-floating-right"
	anchor={true}
	bind:anchorElement={anchor}
	anchorCorner="BOTTOM_LEFT"
>
	<List>
		{#if $walletConnected}
			<!-- Slot name intentionally kept as-is: "connectedMenuIems" (sic) is paired
				with the matching slot declaration in WalletConnectStatus.svelte. -->
			<slot name="connectedMenuIems" />
			<Item on:SMUI:action={async () => disconnectWallet().then(toggleMenu)}>
				<Text>Disconnect</Text>
			</Item>
		{:else}
			<Item on:SMUI:action={() => connect(WALLET_CONNECTORS.metaMask)}>
				<Text>
					<div class="item">
						<img class="logo" src={metamaskLogo} alt="metamask wallet logo" />
						<span>Meta Mask Wallet</span>
					</div>
				</Text>
			</Item>
			<Item on:SMUI:action={() => connect(WALLET_CONNECTORS.partisia)}>
				<Text>
					<div class="item">
						<img class="logo" src={partisiaWalletLogo} alt="partisia wallet logo" />
						<span>Partisia Wallet</span>
					</div>
				</Text>
			</Item>
			<Item on:SMUI:action={() => connect(WALLET_CONNECTORS.ledger)}>
				<Text>
					<div class="item">
						<img class="logo" src={ledgerWalletLogo} alt="ledger wallet logo" />
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
							aria-label="Dev private key (64 hex chars)"
							bind:value={devPrivateKey}
							disabled={connecting}
							on:keydown={(e) => e.key === 'Enter' && connectWithPrivateKey()}
							on:click|stopPropagation
							on:keydown|stopPropagation
						/>
						<button
							class="dev-key-connect"
							on:click|stopPropagation={connectWithPrivateKey}
							disabled={connecting || devPrivateKey.length !== 64}
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
