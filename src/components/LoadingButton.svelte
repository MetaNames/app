<script lang="ts">
	import { alertMessage } from '$lib/stores/main';
	import { captureException } from '@sentry/sveltekit';
	import Button, { Label } from '@smui/button';
	import Icon from 'src/components/Icon.svelte';
	import CircularProgress from '@smui/circular-progress';
	import { onDestroy } from 'svelte';

	let className = '';
	export { className as class };
	export let onClick: () => Promise<void>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let onError: (error: any) => Promise<void> = async (error) => {
		let message;
		if (error && error instanceof Error) message = error.message;
		else message = 'Something went wrong';

		captureException(error);
		console.error(error);
		alertMessage.set(message);
	};
	export let disabled = false;
	export let variant: 'text' | 'raised' | 'unelevated' | 'outlined' = 'raised';

	$: isDisabled = disabled || loading;

	let loading: boolean | undefined;
	let hasError = false;
	let resetTimeout: ReturnType<typeof setTimeout>;

	onDestroy(() => {
		clearTimeout(resetTimeout);
	});

	async function handleClick() {
		if (loading) return;

		clearTimeout(resetTimeout);

		hasError = false;
		loading = true;

		try {
			await onClick();
			resetTimeout = setTimeout(() => {
				loading = undefined;
			}, 3000);
		} catch (error) {
			hasError = true;
			await onError(error);
		}

		loading = false;
	}

	$: statusText = loading ? 'Loading' : hasError ? 'Error' : loading === false ? 'Success' : '';
</script>

<Button class={className} disabled={isDisabled} on:click={handleClick} {variant}>
	<Label>
		<slot />
		<span class="sr-only" role="status" aria-live="polite">{statusText}</span>
	</Label>
	{#if loading}
		<div class="loading" role="progressbar" aria-label="Loading">
			<CircularProgress style="height: 20px; width: 20px;" indeterminate />
		</div>
	{:else if hasError}
		<Icon icon="error" align="right" />
	{:else if loading === false}
		<Icon icon="done" align="right" />
	{/if}
</Button>

<style lang="scss">
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;

		margin-left: 1rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
