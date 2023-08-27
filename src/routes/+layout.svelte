<script lang="ts">
	import IconButton from '@smui/icon-button';
	import Section from '@smui/top-app-bar/src/Section.svelte';
	import TopAppBar, { Row, Title } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import WalletConnect from './WalletConnect.svelte';

	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {};
</script>

<main>
	<TopAppBar variant="static">
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
					<WalletConnect {anchor} />
				</Section>
			</Row>
		</div>
	</TopAppBar>
	<slot />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: stretch;

		gap: 1rem;

		min-height: 100vh;
		background-color: var(--mdc-theme-background);
	}
</style>
