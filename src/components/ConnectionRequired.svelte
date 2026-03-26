<script lang="ts">
	import { walletConnected } from '$lib/stores/main';

	import WalletConnectButton from 'src/routes/WalletConnectButton.svelte';

	let anchor: HTMLDivElement = $state();
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: className = '', children }: Props = $props();

	
</script>

<div class={className}>
	{#if $walletConnected}
		{@render children?.()}
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
