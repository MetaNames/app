<script lang="ts">
	import { dev } from '$app/environment';

	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	import Banner, { Icon } from '@smui/banner';
	import IconButton from '@smui/icon-button';
	import Section from '@smui/top-app-bar/src/Section.svelte';
	import Snackbar, { Actions, Label } from '@smui/snackbar';
	import TopAppBar, { Row, Title } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import WalletConnect from './WalletConnectStatus.svelte';
	import Logo from './Logo.svelte';

	import '../styles/app.scss';
	import Footer from './Footer.svelte';
	import { alertMessage, alertTransaction } from '$lib/stores';
	import Button from '@smui/button';
	import { config, explorerTransactionUrl } from '$lib';

	let anchor: HTMLDivElement;
	let anchorClasses: { [k: string]: boolean } = {};

	let alertsSnackbar: Snackbar;
	let transactionSnackbar: Snackbar;
	let snackbarTransactionMessage: string;
	let snackbarMessage: string;

	let theme: 'light' | 'dark';

	$: contractDisabled = config.contractDisabled;
	$: isTestnet = config.environment === 'test';

	// Analytics
	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	// Snackbars
	alertTransaction.subscribe((transaction) => {
		if (!transaction) return;

		snackbarTransactionMessage = 'New Transaction submitted';
		transactionSnackbar.open();
	});
	alertMessage.subscribe((message) => {
		if (!message) return;

		snackbarMessage = message;
		alertsSnackbar.open();

		setTimeout(() => {
			alertsSnackbar.close();
			alertMessage.set(undefined);
		}, 5000);
	});
</script>

<main data-theme={theme}>
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
	{#if contractDisabled}
		<Banner open={true} centered={true} mobileStacked={true}>
			<Icon slot="icon" class="material-icons">update</Icon>
			<Label slot="label">Contract is temporarily disabled for updates</Label>
			<svelte:fragment slot="actions">
				<Button href="https://t.me/mpc_metanames" target="_blank">Check status</Button>
			</svelte:fragment>
		</Banner>
	{/if}
	<slot />

	<Snackbar bind:this={transactionSnackbar} timeoutMs={-1}>
		<Label>{snackbarTransactionMessage}</Label>
		<Actions>
			<Button
				on:click={() =>
					$alertTransaction && window.open(explorerTransactionUrl($alertTransaction), '_blank')}
				>View</Button
			>
			<IconButton class="material-icons" title="Dismiss">close</IconButton>
		</Actions>
	</Snackbar>
	<Snackbar bind:this={alertsSnackbar}>
		<Label>{snackbarMessage}</Label>
		<Actions>
			<IconButton class="material-icons" title="Dismiss">close</IconButton>
		</Actions>
	</Snackbar>
	<Footer />
</main>

<style>
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

	.separator {
		width: 1px;
		height: 1.5rem;
		background-color: var(--mdc-theme-on-primary);
		margin: 0 1rem;
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
