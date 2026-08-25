<script lang="ts">
	import { onDestroy } from 'svelte';

	import Button from '@smui/button';
	import Icon from 'src/components/Icon.svelte';
	import IconButton from '@smui/icon-button';
	import Snackbar, { Actions, Label } from '@smui/snackbar';

	import { explorerTransactionUrl } from '$lib';
	import { alertMessage, alertTransaction } from '$lib/stores/main';

	let alertsSnackbar: Snackbar;
	let transactionSnackbar: Snackbar;
	let snackbarTransactionMessage = '';
	let snackbarMessage = '';
	let alertsTimeout: ReturnType<typeof setTimeout>;

	// Snackbars
	const unsubscribeAlertTransaction = alertTransaction.subscribe((transaction) => {
		if (!transaction) return;

		snackbarTransactionMessage = 'New Transaction submitted';
		transactionSnackbar?.open();
	});
	const unsubscribeAlertMessage = alertMessage.subscribe((message) => {
		if (!message) return;

		if (typeof message === 'string') snackbarMessage = message;
		else snackbarMessage = message.message;

		alertsSnackbar?.open();

		// One timer, restarted per message: two alerts less than 5s apart used to leave the
		// first one's timer running, so it closed the second one early.
		clearTimeout(alertsTimeout);
		alertsTimeout = setTimeout(() => {
			alertsSnackbar?.close();
		}, 5000);
	});

	onDestroy(() => {
		clearTimeout(alertsTimeout);
		unsubscribeAlertTransaction();
		unsubscribeAlertMessage();
	});
</script>

<Snackbar bind:this={transactionSnackbar} timeoutMs={10_000}>
	<Label>{snackbarTransactionMessage}</Label>
	<Actions>
		<Button
			on:click={() =>
				$alertTransaction &&
				window.open(explorerTransactionUrl($alertTransaction), '_blank', 'noopener,noreferrer')}
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
			<Button on:click={$alertMessage.action.callback}>{$alertMessage.action.label}</Button>
		{/if}
		<IconButton title="Dismiss" aria-label="close">
			<Icon icon="close" />
		</IconButton>
	</Actions>
</Snackbar>
