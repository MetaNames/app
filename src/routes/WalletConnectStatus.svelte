<script lang="ts">
	import { walletAddress } from '$lib/stores';
	import { derived } from 'svelte/store';

	import { Icon, Label } from '@smui/button';
	import { Item, Text } from '@smui/list';

	import '../styles/wallet-connect.scss';
	import { goto } from '$app/navigation';
	import WalletConnectButton from './WalletConnectButton.svelte';

	const shortAddress = derived(walletAddress, ($address) => {
		if ($address) return $address.slice(0, 4) + '...' + $address.slice(-4);
	});

	$: buttonLabel = $shortAddress ? $shortAddress : 'Connect Wallet';

	export let anchor: HTMLDivElement;
</script>

<WalletConnectButton connectButtonVariant="unelevated" {anchor}>
	<div class="wallet-connect" slot="buttonLabel">
		<Icon class="material-icons" aria-label="Wallet">wallet</Icon>
		<Label>{buttonLabel}</Label>
	</div>
	<div slot="connectedMenuIems">
		<Item on:SMUI:action={() => goto('/profile')}>
			<Text>Profile</Text>
		</Item>
	</div>
</WalletConnectButton>

<style lang="scss">
	.wallet-connect {
		display: flex;
		align-items: center;
	}
</style>
