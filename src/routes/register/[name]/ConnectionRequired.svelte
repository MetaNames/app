<script lang="ts">
	import { walletConnected } from '$lib/stores';

	import WalletConnectButton from '../../WalletConnectButton.svelte';

	let anchor: HTMLDivElement;
	let className: string = "";

	export { className as class };
</script>

<div class={className}>
	{#if $walletConnected}
		<slot />
	{:else}
		<div class="connect-container">
			<div class="connect" bind:this={anchor}>
				<WalletConnectButton {anchor} />
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.connect-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.connect {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>
