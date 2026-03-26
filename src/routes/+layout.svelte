<script lang="ts">
	import { dev } from '$app/environment';

	import { inject } from '@vercel/analytics';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	import Button from '@smui/button';
	import Banner from '@smui/banner';
	import Icon from 'src/components/Icon.svelte';
	import IconButton from '@smui/icon-button';
	import Snackbar, { Actions, Label } from '@smui/snackbar';
	import TopAppBar, { Row, Title, Section } from '@smui/top-app-bar';
	import { Anchor } from '@smui/menu-surface';

	import { config, explorerTransactionUrl } from '$lib';
	import { alertMessage, alertTransaction } from '$lib/stores/main';
	import WalletConnect from 'src/routes/WalletConnectStatus.svelte';
	import Logo from 'src/routes/Logo.svelte';
	import Footer from 'src/routes/Footer.svelte';
	import favicon from '$lib/assets/images/favicon.png';

	import 'src/styles/app.scss';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let anchor: HTMLDivElement | undefined = $state(undefined);
	let anchorClasses: { [k: string]: boolean } = $state({});

	let alertsSnackbar: Snackbar | undefined = $state();
	let transactionSnackbar: Snackbar | undefined = $state();
	let snackbarTransactionMessage: string = $state('');
	let snackbarMessage: string = $state('');

	let contractDisabled = $derived(config.contractDisabled);
	let isTestnet = $derived(config.environment === 'test');

	// Analytics
	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	// Snackbars
	$effect(() => {
		const transaction = $alertTransaction;
		if (!transaction) return;

		snackbarTransactionMessage = 'New Transaction submitted';
		transactionSnackbar?.open();
	});
	$effect(() => {
		const message = $alertMessage;
		if (!message) return;

		if (typeof message === 'string') snackbarMessage = message;
		else snackbarMessage = message.message;

		alertsSnackbar?.open();

		setTimeout(() => {
			alertsSnackbar?.close();
		}, 5000);
	});
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
					<WalletConnect anchor={anchor!} />
				</Section>
			</Row>
		</div>
	</TopAppBar>

	<main>
		{#if contractDisabled}
			<Banner open={true} centered={true} mobileStacked={true}>
				{#snippet icon()}<div class="icon-center">
						<Icon icon="system-update" width="25px" height="25px" color="white" />
					</div>{/snippet}
				{#snippet label()}<Label>Contract is temporarily disabled for updates</Label>{/snippet}
				{#snippet actions()}<Button href="https://t.me/mpc_metanames" target="_blank"
						>Check status</Button
					>{/snippet}
			</Banner>
		{/if}
		{@render children?.()}
	</main>

	<Snackbar bind:this={transactionSnackbar} timeoutMs={10_000}>
		<Label>{snackbarTransactionMessage}</Label>
		<Actions>
			<Button
				onclick={() =>
					$alertTransaction && window.open(explorerTransactionUrl($alertTransaction), '_blank')}
				>View</Button
			>
			<IconButton title="Dismiss" aria-label="close">
				<Icon icon="close" />
			</IconButton>
		</Actions>
	</Snackbar>
	<Snackbar bind:this={alertsSnackbar}>
		<Label>{snackbarMessage}</Label>
		<Actions>
			{#if $alertMessage && typeof $alertMessage !== 'string' && $alertMessage.action}
				<Button onclick={$alertMessage.action.callback}>{$alertMessage.action.label}</Button>
			{/if}
			<IconButton title="Dismiss" aria-label="close">
				<Icon icon="close" />
			</IconButton>
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

	.separator {
		width: 1px;
		height: 1.5rem;
		background-color: var(--mdc-theme-on-primary);
		margin: 0 1rem;
	}

	.logo {
		color: white;
	}

	.icon-center {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>
