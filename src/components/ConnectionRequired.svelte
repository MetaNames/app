<script lang="ts">
	import { walletConnected } from '$lib/stores/main';

	import WalletConnectButton from 'src/routes/WalletConnectButton.svelte';

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: className = '', children }: Props = $props();

	let anchor: HTMLDivElement | undefined = $state(undefined);
</script>

<div class={className}>
	{#if $walletConnected}
		{@render children?.()}
	{:else}
		<div class="connect-container">
			<div class="connect" bind:this={anchor}>
				<WalletConnectButton anchor={anchor!} />
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
