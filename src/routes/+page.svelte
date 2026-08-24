<script lang="ts">
	import DomainSearch from 'src/routes/DomainSearch.svelte';
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h1 class="type-headline3">Find your Meta Name</h1>
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
		// --mdc-theme-text-hint-on-background is rgba(255,255,255,.5), which composites to
		// #9b9a9a on the #363535 background: 4.36:1, under the 4.5:1 SC 1.4.3 needs at 10px.
		// The secondary token is rgba(255,255,255,.7) -> #c3c2c2 -> 6.88:1.
		color: var(--mdc-theme-text-secondary-on-background);
	}
	h1 {
		margin-top: auto;
		margin-bottom: 0.5rem;
	}
</style>
