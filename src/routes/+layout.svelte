<script lang="ts">
	import { dev } from '$app/environment';

	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	import Button from '@smui/button';
	import Banner, { Label } from '@smui/banner';
	import Icon from 'src/components/Icon.svelte';
	import SnackbarHost from 'src/components/SnackbarHost.svelte';
	import TopAppBar, { Row, Title, Section } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import { config } from '$lib';
	import WalletConnect from 'src/routes/WalletConnectStatus.svelte';
	import Logo from 'src/routes/Logo.svelte';
	import Footer from 'src/routes/Footer.svelte';
	import favicon from '$lib/assets/images/favicon.png';

	import 'src/styles/app.scss';

	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {};

	$: contractDisabled = config.contractDisabled;
	$: isTestnet = config.environment === 'test';

	// Analytics
	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container">
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
					<Title>
						<a class="link-logo" href="/">
							<Logo />
							<span>Meta Names</span>
							{#if isTestnet}
								<span class="testnet">TESTNET</span>
							{/if}
						</a>
					</Title>
				</Section>

				<Section align="end" toolbar>
					<WalletConnect {anchor} />
				</Section>
			</Row>
		</div>
	</TopAppBar>

	<main>
		{#if contractDisabled}
			<Banner open={true} centered={true} mobileStacked={true}>
				<div class="icon-center" slot="icon">
					<Icon icon="system-update" width="25px" height="25px" color="white" />
				</div>
				<Label slot="label">Contract is temporarily disabled for updates</Label>
				<svelte:fragment slot="actions">
					<Button href="https://t.me/mpc_metanames" target="_blank" rel="noopener noreferrer"
						>Check status</Button
					>
				</svelte:fragment>
			</Banner>
		{/if}
		<slot />
	</main>

	<SnackbarHost />
	<Footer />
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--mdc-theme-background);
		flex-grow: 1;
	}

	@media only screen and (max-width: 768px) {
		main {
			display: flex;
			flex-direction: column;
			background-color: var(--mdc-theme-background);
		}
	}
	.testnet {
		background-color: var(--mdc-theme-background);
		font-weight: bold;
		font-size: x-small;
		line-height: 1.5rem;
		padding: 0.1rem 0.5rem;
		border-radius: 0.25rem;
		margin-left: 0.5rem;
	}

	.link-logo {
		display: flex;
		flex-direction: row;
		align-items: center;

		text-decoration: none;
		color: inherit;
	}

	.icon-center {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>
