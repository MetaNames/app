<script lang="ts">
	import DomainSearch from './DomainSearch.svelte';
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="content">
	<h3>Find your Meta Name</h3>
	<p class="subtitle">Powered by Partisia</p>
	<div class="search-container">
		<DomainSearch />
	</div>
</div>

<style lang="scss">
	.subtitle {
		text-transform: uppercase;
		font-size: x-small;
		color: var(--mdc-theme-text-hint-on-background)
	}
	h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.search-container {
		display: inline-block;
	}
</style>
