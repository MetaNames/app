<!-- @migration-task Error while migrating Svelte code: can't migrate `$: buttonLabel = $shortAddress ? $shortAddress : 'Connect Wallet';` to `$derived` because there's a variable named derived.
     Rename the variable and try again or migrate by hand. -->
<script lang="ts">
	import { walletAddress } from '$lib/stores/main';
	import { derived } from 'svelte/store';

	import Icon from 'src/components/Icon.svelte';
	import { Item, Text } from '@smui/list';

	import 'src/styles/wallet-connect.scss';
	import { goto } from '$app/navigation';
	import WalletConnectButton from 'src/routes/WalletConnectButton.svelte';

	const shortAddress = derived(walletAddress, ($address) => {
		if ($address) return $address.slice(0, 4) + '...' + $address.slice(-4);
	});

	let walletLabel = $derived($shortAddress ? $shortAddress : 'Connect Wallet');

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
