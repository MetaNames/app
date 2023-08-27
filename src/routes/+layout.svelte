<script lang="ts">
	import IconButton from '@smui/icon-button';
	import Section from '@smui/top-app-bar/src/Section.svelte';
	import TopAppBar, { AutoAdjust, Row, Title } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import WalletConnect from './WalletConnect.svelte';

	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {};
	let topAppBar: TopAppBar;
	let walletConnect: WalletConnect;
</script>

<TopAppBar bind:this={topAppBar} variant="standard">
	<div
		class={Object.keys(anchorClasses).join(' ')}
		use:Anchor={{
			addClass: (className) => {
				if (!anchorClasses[className]) {
					anchorClasses[className] = true;
				}
			},
			removeClass: (className) => {
				if (anchorClasses[className]) {
					delete anchorClasses[className];
					anchorClasses = anchorClasses;
				}
			}
		}}
		bind:this={anchor}
	>
		<Row>
			<Section>
				<IconButton class="material-icons">menu</IconButton>
				<Title>Meta Names</Title>
			</Section>

			<Section align="end" toolbar>
				<WalletConnect {anchor} bind:this={walletConnect} />
			</Section>
		</Row>
	</div>
</TopAppBar>

<AutoAdjust {topAppBar} on:mousewheel={() => walletConnect.closeMenu()}>
	<slot />
</AutoAdjust>
