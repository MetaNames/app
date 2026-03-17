<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	import { inject } from '@vercel/analytics';
	// import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	import Button from '$lib/components/Button.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import IconButton from '$lib/components/IconButton.svelte';
	import Snackbar from '$lib/components/Snackbar.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	import { config, explorerTransactionUrl } from '$lib';
	import { alertMessage, alertTransaction } from '$lib/stores/main';
	import WalletConnect from '$lib/components/WalletConnectStatus.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import Footer from '$lib/components/Footer.svelte';

	import favicon from '$lib/assets/images/favicon.png';

	import 'src/styles/app.scss';

	let snackbarOpen = false;
	let transactionSnackbarOpen = false;
	let snackbarTransactionMessage: string;
	let snackbarMessage: string;

	$: contractDisabled = config.contractDisabled;
	$: isTestnet = config.environment === 'test';

	// Analytics
	inject({ mode: dev ? 'development' : 'production' });
	// injectSpeedInsights();

	// Snackbars
	alertTransaction.subscribe((transaction) => {
		if (!transaction) return;

		snackbarTransactionMessage = 'New Transaction submitted';
		transactionSnackbarOpen = true;
	});
	alertMessage.subscribe((message) => {
		if (!message) return;

		if (typeof message === 'string') snackbarMessage = message;
		else snackbarMessage = message.message;

		snackbarOpen = true;

		setTimeout(() => {
			snackbarOpen = false;
		}, 5000);
	});

	function handleTransactionAction() {
		if ($alertTransaction) {
			window.open(explorerTransactionUrl($alertTransaction), '_blank');
		}
	}

	function handleAlertAction() {
		if ($alertMessage && typeof $alertMessage !== 'string' && $alertMessage.action) {
			$alertMessage.action.callback();
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container">
	<Navbar>
		<a slot="start" class="link-logo" href="/">
			<Logo />
			<span>Meta Names</span>
			{#if isTestnet}
				<span class="testnet">TESTNET</span>
			{/if}
		</a>
		<div slot="end">
			<WalletConnect />
		</div>
	</Navbar>

	<main>
		{#if contractDisabled}
			<Banner open={true} centered={true} mobileStacked={true}>
				<div slot="icon">
					<Icon icon="system-update" width="25px" height="25px" color="white" />
				</div>
				<div slot="label">Contract is temporarily disabled for updates</div>
				<div slot="actions">
					<Button href="https://t.me/mpc_metanames" target="_blank" variant="secondary">Check status</Button>
				</div>
			</Banner>
		{/if}
		{#key $page.url.pathname}
			<div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
				<slot />
			</div>
		{/key}
	</main>

	<Snackbar bind:open={transactionSnackbarOpen} timeoutMs={10_000}>
		<div slot="label">{snackbarTransactionMessage}</div>
		<div slot="actions">
			<Button on:click={handleTransactionAction}>View</Button>
			<IconButton icon="close" aria-label="close" />
		</div>
	</Snackbar>
	<Snackbar bind:open={snackbarOpen}>
		<div slot="label">{snackbarMessage}</div>
		<div slot="actions">
			{#if $alertMessage && typeof $alertMessage !== 'string' && $alertMessage.action}
				<Button on:click={handleAlertAction}>{$alertMessage.action.label}</Button>
			{/if}
			<IconButton icon="close" aria-label="close" />
		</div>
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
		background-color: var(--bg-primary);
		flex-grow: 1;
		width: 100%;
	}

	@media only screen and (max-width: 768px) {
		main {
			display: flex;
			flex-direction: column;
			background-color: var(--bg-primary);
		}
	}

	.testnet {
		background: var(--bg-card);
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
		color: var(--text-primary);
		gap: 0.5rem;
	}

	.separator {
		width: 1px;
		height: 1.5rem;
		background-color: var(--text-secondary);
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
