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
	export let onError: (error: unknown) => Promise<void> = async (error) => {
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

		hasError = false;
		loading = true;
		hasError = false;

		try {
			await onClick();
		} catch (error) {
			hasError = true;
			await onError(error);
		}

		loading = false;

		if (!hasError) {
			clearTimeout(resetTimeout);
			resetTimeout = setTimeout(() => {
				loading = undefined;
			}, 3000);
		}
	}
</script>

<Button
	class={className}
	disabled={isDisabled}
	on:click={handleClick}
	{variant}
	aria-busy={loading}
>
	<Label><slot /></Label>
	{#if loading}
		<div class="loading" role="status" aria-label="Loading">
			<CircularProgress style="height: 20px; width: 20px;" indeterminate />
		</div>
	{:else if hasError}
		<Icon icon="error" align="right" aria-label="Error" />
	{:else if loading === false}
		<Icon icon="done" align="right" aria-label="Success" />
	{/if}
</Button>

<style lang="scss">
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;

		margin-left: 1rem;
	}
</style>
