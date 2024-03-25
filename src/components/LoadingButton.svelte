<script lang="ts">
	import { alertMessage } from '$lib/stores/main';
	import { captureException } from '@sentry/sveltekit';
	import Button, { Icon, Label } from '@smui/button';
	import CircularProgress from '@smui/circular-progress';

	let className = '';
	export { className as class };
	export let onClick: () => Promise<void>;
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

	async function handleClick() {
		if (loading) return;

		loading = true;

		try {
			await onClick();
		} catch (error) {
			hasError = true;
			await onError(error);
		}

		loading = false;
	}
</script>

<Button class={className} disabled={isDisabled} on:click={handleClick} {variant}>
	<Label><slot /></Label>
	{#if loading}
		<div class="loading">
			<CircularProgress style="height: 20px; width: 20px;" indeterminate />
		</div>
	{:else if hasError}
		<Icon class="material-icons" aria-label="error">error</Icon>
	{:else if loading === false}
		<Icon class="material-icons" aria-label="done">done</Icon>
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
