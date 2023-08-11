<script lang="ts">
	import IconButton from '@smui/icon-button';
	import Section from '@smui/top-app-bar/src/Section.svelte';
	import TopAppBar, { AutoAdjust, Row, Title } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import WalletConnect from './WalletConnect.svelte';

	let topAppBar: TopAppBar;
	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {};
</script>

<svelte:head>
	<title>Meta Names</title>
</svelte:head>

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
				<WalletConnect {anchor} />
			</Section>
		</Row>
	</div>
</TopAppBar>

<AutoAdjust {topAppBar}>
	<div class="hero hero-primary">
		<div class="content">
			<h1>Meta Names</h1>
			<h5>The only name you need</h5>
		</div>
	</div>
</AutoAdjust>

<style>
	.content {
		max-width: 1280px;
		margin: 0 auto;
		padding: 8rem;
		text-align: center;

		@media only screen and (max-width: 600px) {
			padding: 10%;
		}
	}

	.hero,
	.hero-primary {
		background-color: var(--mdc-theme-primary);
	}
</style>
