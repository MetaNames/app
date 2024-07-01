<script lang="ts">
	import DomainSearch from 'src/routes/DomainSearch.svelte';
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h3>Find your Meta Name</h3>
		<p class="subtitle">Powered by Partisia</p>
	</div>
	<DomainSearch />
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		flex-grow: 1;
	}

	.header {
		display: flex;
		flex-direction: column;
		text-align: center;
		margin-top: 10rem;
	}
	.subtitle {
		text-transform: uppercase;
		font-size: x-small;
		color: var(--mdc-theme-text-hint-on-background);
	}
	h3 {
		margin-top: auto;
		margin-bottom: 0.5rem;
	}
</style>
