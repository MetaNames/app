<script lang="ts">
	import DomainSearch from '$lib/components/DomainSearch.svelte';
	import { reveal } from '$lib/actions/reveal';
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="container">
	<div class="header" use:reveal={{ delay: 0, threshold: 0.2 }}>
		<h3>Find your Meta Name</h3>
		<p class="subtitle">Powered by Partisia</p>
	</div>
	<div use:reveal={{ delay: 150, threshold: 0.1 }}>
		<DomainSearch />
	</div>
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
