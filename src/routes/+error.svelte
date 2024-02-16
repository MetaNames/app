<script>
	import { page } from '$app/stores';
	import GoBackButton from 'src/components/GoBackButton.svelte';
</script>

<svelte:head>
	<title>{$page.status}</title>
</svelte:head>

<div class="content">
	{#if $page.status === 404}
		<h2>Not found!</h2>
		<GoBackButton />
	{:else}
		<h2>Something went wrong</h2>
		<GoBackButton />
	{/if}
</div>
