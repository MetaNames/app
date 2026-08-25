<script>
	import { page } from '$app/stores';
	import GoBackButton from 'src/components/GoBackButton.svelte';
</script>

<svelte:head>
	<title>{$page.status === 404 ? 'Not found' : 'Something went wrong'} | Meta Names</title>
</svelte:head>

<!-- One branch: the statuses differ only in the words, so the markup should not differ either. -->
<div class="content">
	<h1 class="type-headline2">{$page.status === 404 ? 'Not found!' : 'Something went wrong'}</h1>
	<GoBackButton />
</div>
