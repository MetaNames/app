<script>
	import { page } from '$app/stores';
	import GoBackButton from 'src/components/GoBackButton.svelte';
</script>

<svelte:head>
	<title>{$page.status}</title>
</svelte:head>

<div class="content">
	{#if $page.status === 404}
		<h1 class="type-headline2">Not found!</h1>
		<GoBackButton />
	{:else}
		<h1 class="type-headline2">Something went wrong</h1>
		<GoBackButton />
	{/if}
</div>
