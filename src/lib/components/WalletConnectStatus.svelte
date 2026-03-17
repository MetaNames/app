<script lang="ts">
	import { walletAddress } from '$lib/stores/main';
	import { derived } from 'svelte/store';

	import Icon from '$lib/components/Icon.svelte';
	import MenuItem from './MenuItem.svelte';

	import 'src/styles/wallet-connect.scss';
	import { goto } from '$app/navigation';
	import WalletConnectButton from '$lib/components/WalletConnectButton.svelte';

	const shortAddress = derived(walletAddress, ($address) => {
		if ($address) return $address.slice(0, 4) + '...' + $address.slice(-4);
	});

	$: buttonLabel = $shortAddress ? $shortAddress : 'Connect Wallet';

	export let anchor: HTMLDivElement;
</script>

<WalletConnectButton connectButtonVariant="unelevated" {anchor}>
	<div class="wallet-connect" slot="buttonLabel">
		<Icon icon="wallet" align="left" />
		<span>{buttonLabel}</span>
	</div>
	<div slot="connectedMenuIems">
		<MenuItem onClick={() => goto('/profile')}>
			Profile
		</MenuItem>
	</div>
</WalletConnectButton>

<style lang="scss">
	.wallet-connect {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
