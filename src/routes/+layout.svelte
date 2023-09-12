<script lang="ts">
	import IconButton from '@smui/icon-button';
	import Section from '@smui/top-app-bar/src/Section.svelte';
	import TopAppBar, { Row, Title } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import WalletConnect from './WalletConnect.svelte';
	import Logo from './Logo.svelte';

	import '../styles/app.scss';
	import Footer from './Footer.svelte';

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
					<Title>
						<a class="link-logo" href="/">
							<Logo/>
							<span>Meta Names</span>
						</a>
					</Title>
				</Section>

				<Section align="end" toolbar>
					<WalletConnect {anchor} />
				</Section>
			</Row>
		</div>
	</TopAppBar>
	<slot />
	<Footer />
</main>

<style>
	.link-logo {
		display: flex;
		flex-direction: row;
		align-items: center;

		text-decoration: none;
		color: inherit;
	}

	svg {
		width: 1.5rem;
		height: 1.5rem;
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: stretch;

		gap: 1rem;

		min-height: 100vh;
		background-color: var(--mdc-theme-background);
	}

	.logo {
		color: white;
	}
</style>
