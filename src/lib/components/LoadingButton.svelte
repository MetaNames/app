<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { alertMessage } from '$lib/stores/main';
	import { captureException } from '@sentry/sveltekit';
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
	export let variant: 'primary' | 'secondary' | 'text' = 'primary';

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
	variant={variant}
	loading={loading === true}
>
	{#if hasError}
		<Icon icon="error" align="right" aria-label="Error" />
	{:else if loading === false}
		<Icon icon="done" align="right" aria-label="Success" />
	{/if}
	<slot />
</Button>
