<script lang="ts">
	import { config } from '$lib';
	import { walletAddress } from '$lib/stores/main';

	let devPrivateKey = '';
	let showPanel = false;
	let walletLabel = '';

	$: isTestnet = config.environment === 'test';

	async function deriveAddressFromPrivateKey(privateKey: string): Promise<string | null> {
		try {
			const { privateKeyToAccountAddress } = await import(
				'partisia-blockchain-applications-crypto/lib/main/wallet'
			);
			return privateKeyToAccountAddress(privateKey);
		} catch {
			return null;
		}
	}

	async function connectWithPrivateKey() {
		if (!devPrivateKey || devPrivateKey.length !== 64) return;

		const { metaNamesSdk } = await import('$lib/stores/sdk');
		const address = await deriveAddressFromPrivateKey(devPrivateKey);
		if (!address) {
			walletLabel = 'Invalid private key';
			return;
		}

		metaNamesSdk.update((sdk) => {
			sdk.setSigningStrategy('privateKey', devPrivateKey);
			return sdk;
		});

		walletAddress.set(address);
		walletLabel = `✅ ${address.slice(0, 10)}...${address.slice(-6)}`;
		devPrivateKey = '';
	}

	async function disconnect() {
		walletAddress.set(undefined);
		const { metaNamesSdk } = await import('$lib/stores/sdk');
		metaNamesSdk.update((sdk) => {
			sdk.resetSigningStrategy();
			return sdk;
		});
		walletLabel = '';
	}
</script>

{#if isTestnet}
	<div class="dev-wallet">
		<button class="dev-toggle" on:click={() => (showPanel = !showPanel)}>
			🐷 Dev Wallet
		</button>

		{#if showPanel}
			<div class="dev-panel">
				<p class="dev-title">Testnet Only</p>

				{#if walletLabel}
					<div class="wallet-status">
						<span>{walletLabel}</span>
						<button class="disconnect" on:click={disconnect}>Disconnect</button>
					</div>
				{:else}
					<p class="warning">⚠️ Only for testnet. Never use real keys on mainnet.</p>
					<div class="input-row">
						<input
							type="password"
							placeholder="Paste private key (64 chars)..."
							bind:value={devPrivateKey}
							on:keydown={(e) => e.key === 'Enter' && connectWithPrivateKey()}
						/>
						<button on:click={connectWithPrivateKey} disabled={devPrivateKey.length !== 64}>
							Connect
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.dev-wallet {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 9999;
		font-family: monospace;
	}

	.dev-toggle {
		background: #ff6b6b;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: bold;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.dev-panel {
		position: absolute;
		bottom: 100%;
		right: 0;
		background: #1a1a2e;
		color: white;
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		min-width: 320px;
		margin-bottom: 0.5rem;
	}

	.dev-title {
		margin: 0 0 0.75rem 0;
		font-size: 0.75rem;
		color: #ff6b6b;
		text-transform: uppercase;
	}

	.wallet-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem;
		background: #0f0f1a;
		border-radius: 0.25rem;
		font-size: 0.8rem;
		gap: 0.5rem;
	}

	.disconnect {
		background: #ff6b6b;
		color: white;
		border: none;
		padding: 0.3rem 0.6rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.7rem;
	}

	.warning {
		margin: 0 0 0.75rem 0;
		font-size: 0.7rem;
		color: #ff6b6b;
	}

	.input-row {
		display: flex;
		gap: 0.5rem;
	}

	.input-row input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #333;
		border-radius: 0.25rem;
		background: #0f0f1a;
		color: white;
		font-family: monospace;
		font-size: 0.8rem;
	}

	.input-row input::placeholder {
		color: #555;
	}

	.input-row button {
		padding: 0.5rem 1rem;
		background: #4ecdc4;
		color: #1a1a2e;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-weight: bold;
	}

	.input-row button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
