<script lang="ts">
	import { walletAddress } from '$lib/stores/main';

	import Icon from 'src/components/Icon.svelte';
	import { Item, Text } from '@smui/list';

	import 'src/styles/wallet-connect.scss';
	import { goto } from '$app/navigation';
	import WalletConnectButton from 'src/routes/WalletConnectButton.svelte';

	let shortAddress = $derived(
		$walletAddress ? $walletAddress.slice(0, 4) + '...' + $walletAddress.slice(-4) : undefined
	);
	let walletLabel = $derived(shortAddress ?? 'Connect Wallet');

	interface Props {
		anchor: HTMLDivElement;
	}

	let { anchor }: Props = $props();
</script>

<WalletConnectButton connectButtonVariant="unelevated" {anchor} testid="wallet-connect-btn">
	{#snippet buttonLabelContent()}
		<div class="wallet-connect">
			<Icon icon="wallet" align="left" />
			<span>{walletLabel}</span>
		</div>
	{/snippet}
	{#snippet connectedMenuItems()}
		<Item onSMUIAction={() => goto('/profile')}>
			<Text>Profile</Text>
		</Item>
	{/snippet}
</WalletConnectButton>

<style lang="scss">
	.wallet-connect {
		display: flex;
		align-items: center;
	}
</style>
