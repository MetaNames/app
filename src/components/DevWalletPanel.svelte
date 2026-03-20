<script lang="ts">
	import { config } from '$lib';
	import { walletAddress } from '$lib/stores/main';

	let devAddress = '';
	let devPrivateKey = '';
	let showPanel = false;
	let showAdvanced = false;
	let walletLabel = '';

	$: isTestnet = config.environment === 'test';

	async function clearWallet() {
		walletAddress.set(undefined);
		const { metaNamesSdk } = await import('$lib/stores/sdk');
		metaNamesSdk.update((sdk) => {
			sdk.resetSigningStrategy();
			return sdk;
		});
		walletLabel = '';
	}

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

	async function injectPrivateKey() {
		if (!devPrivateKey || devPrivateKey.length !== 64) return;

		const { metaNamesSdk } = await import('$lib/stores/sdk');
		const address = await deriveAddressFromPrivateKey(devPrivateKey);
		if (!address) {
			walletLabel = 'Invalid private key';
			return;
		}

		// Set signing strategy to private key
		metaNamesSdk.update((sdk) => {
			sdk.setSigningStrategy('privateKey', devPrivateKey);
			return sdk;
		});

		walletAddress.set(address);
		walletLabel = `✅ Connected: ${address.slice(0, 10)}...${address.slice(-6)}`;
		devPrivateKey = '';
		showAdvanced = false;
	}

	async function injectAddress() {
		if (!devAddress || devAddress.length !== 66) return;

		// Just set the address for UI testing - no signing possible
		walletAddress.set(devAddress);
		walletLabel = `UI Mode: ${devAddress.slice(0, 10)}...${devAddress.slice(-6)} (read-only)`;
		devAddress = '';
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
						<button class="clear-btn" on:click={clearWallet}>×</button>
					</div>
				{:else}
					<div class="section">
						<p class="section-label">Address Only (UI Testing)</p>
						<div class="input-row">
							<input
								type="text"
								placeholder="Paste Partisia address (66 chars)..."
								bind:value={devAddress}
								on:keydown={(e) => e.key === 'Enter' && injectAddress()}
							/>
							<button on:click={injectAddress} disabled={devAddress.length !== 66}>
								Inject
							</button>
						</div>
					</div>

					<div class="section">
						<button class="advanced-toggle" on:click={() => (showAdvanced = !showAdvanced)}>
							{showAdvanced ? '▼' : '▶'} Full Access (Private Key)
						</button>

						{#if showAdvanced}
							<p class="warning">⚠️ Only for testnet. Never use real keys on mainnet.</p>
							<div class="input-row">
								<input
									type="password"
									placeholder="Paste private key (64 chars)..."
									bind:value={devPrivateKey}
									on:keydown={(e) => e.key === 'Enter' && injectPrivateKey()}
								/>
								<button on:click={injectPrivateKey} disabled={devPrivateKey.length !== 64}>
									Sign In
								</button>
							</div>
							<p class="hint">
								Private key is used to sign transactions locally. No data is sent anywhere.
							</p>
						{/if}
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
		min-width: 340px;
		margin-bottom: 0.5rem;
	}

	.dev-title {
		margin: 0 0 0.75rem 0;
		font-size: 0.75rem;
		color: #ff6b6b;
		text-transform: uppercase;
	}

	.section {
		margin-bottom: 0.75rem;
	}

	.section-label {
		margin: 0 0 0.5rem 0;
		font-size: 0.7rem;
		color: #888;
		text-transform: uppercase;
	}

	.wallet-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem;
		background: #0f0f1a;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		gap: 0.5rem;
	}

	.clear-btn {
		background: #ff6b6b;
		color: white;
		border: none;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
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

	.advanced-toggle {
		background: none;
		border: none;
		color: #4ecdc4;
		cursor: pointer;
		font-size: 0.75rem;
		padding: 0;
		text-transform: uppercase;
	}

	.warning {
		margin: 0.5rem 0;
		font-size: 0.7rem;
		color: #ff6b6b;
	}

	.hint {
		margin: 0.5rem 0 0 0;
		font-size: 0.65rem;
		color: #666;
	}
</style>
