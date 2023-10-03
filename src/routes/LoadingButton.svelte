<script lang="ts">
	import Button, { Icon, Label } from '@smui/button';
	import CircularProgress from '@smui/circular-progress';

	export let onClick: () => Promise<void>;
	export let disabled = false;
	export let variant: 'text' | 'raised' | 'unelevated' | 'outlined' = 'raised';

	$: isDisabled = disabled || loading;

	let loading: boolean | undefined;
	let error = false;

	async function handleClick() {
		if (loading) return;

		loading = true;

		try {
			await onClick();
		} catch (error) {
			error = true;
		}

		loading = false;
	}
</script>

<Button disabled={isDisabled} on:click={handleClick} {variant}>
	<Label><slot /></Label>
	{#if loading}
		<div class="loading">
			<CircularProgress style="height: 20px; width: 20px;" indeterminate />
		</div>
	{:else if error}
		<Icon class="material-icons" aria-label="Wallet">error</Icon>
	{:else if loading === false}
		<Icon class="material-icons" aria-label="Wallet">done</Icon>
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
