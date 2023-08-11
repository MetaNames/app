<script lang="ts">
	import Layout from './Layout.svelte';
</script>

<svelte:head>
	<title>Meta Names</title>
</svelte:head>

<Layout>
	<div class="hero hero-primary">
		<div class="content">
			<h1>Meta Names</h1>
			<h5>The only name you need</h5>
		</div>
	</div>
</Layout>

<style>
	.content {
		max-width: 1280px;
		margin: 0 auto;
		padding: 8rem;
		text-align: center;

		@media only screen and (max-width: 600px) {
			padding: 10%;
		}
	}

	.hero,
	.hero-primary {
		background-color: var(--mdc-theme-primary);
	}
</style>
