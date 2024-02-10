<script lang="ts">
	import { dev } from '$app/environment';

	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	import Button from '@smui/button';
	import Banner, { Icon } from '@smui/banner';
	import IconButton from '@smui/icon-button';
	import Section from '@smui/top-app-bar/src/Section.svelte';
	import Snackbar, { Actions, Label } from '@smui/snackbar';
	import TopAppBar, { Row, Title } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import { config, explorerTransactionUrl } from '$lib';
	import { alertMessage, alertTransaction } from '$lib/stores/main';
	import WalletConnect from 'src/routes/WalletConnectStatus.svelte';
	import Logo from 'src/routes/Logo.svelte';
	import Footer from 'src/routes/Footer.svelte';

	import 'src/styles/app.scss';
	import 'material-icons/iconfont/filled.css';

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

		if (typeof message === 'string') snackbarMessage = message;
		else snackbarMessage = message.message;

		alertsSnackbar.open();

		setTimeout(() => {
			alertsSnackbar.close();
			alertMessage.set(undefined);
		}, 5000);
	});
</script>

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
				<Icon slot="icon" class="material-icons">update</Icon>
				<Label slot="label">Contract is temporarily disabled for updates</Label>
				<svelte:fragment slot="actions">
					<Button href="https://t.me/mpc_metanames" target="_blank">Check status</Button>
				</svelte:fragment>
			</Banner>
		{/if}
		<slot />
	</main>

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
			{#if $alertMessage && typeof $alertMessage !== 'string' && $alertMessage.action}
				<Button on:click={$alertMessage.action.callback}>{$alertMessage.action.label}</Button>
			{/if}
			<IconButton class="material-icons" title="Dismiss">close</IconButton>
		</Actions>
	</Snackbar>
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

	:global(footer) {
		height: 80px;
	}

	:global(header) {
		height: 64px;
	}

	@media only screen and (max-width: 768px) {
		:global(header) {
			height: 56px;
		}
		main {
			display: flex;
			flex-direction: column;
			background-color: var(--mdc-theme-background);
		}

		:global(footer) {
			height: 88px;
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

	.separator {
		width: 1px;
		height: 1.5rem;
		background-color: var(--mdc-theme-on-primary);
		margin: 0 1rem;
	}

	.logo {
		color: white;
	}
</style>
