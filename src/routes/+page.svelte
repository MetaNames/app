<script lang="ts">
	import DomainSearch from './DomainSearch.svelte';
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="content">
	<h3>Find your Meta Name</h3>
	<p>Choose your decentralised name to use it for wallets, social, websites, and more!</p>
	<div class="search-container">
		<DomainSearch />
	</div>
</div>

<style lang="scss">
	h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.search-container {
		display: inline-block;
	}
</style>
