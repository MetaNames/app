<script lang="ts">
	import Layout from './Layout.svelte';
	import LookUp from './LookUp.svelte';
</script>

<svelte:head>
	<title>Meta Names</title>
</svelte:head>

<Layout>
	<div class="hero-primary">
		<div class="content">
			<h1>Meta Names</h1>
			<h5>The only name you need</h5>
		</div>
	</div>
	<div class="hero-secondary">
		<div class="content">
			<h1>Look Up</h1>
			<h5>Find your Meta Name</h5>
			<div class="lookup-container">
				<LookUp />
			</div>
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

	.hero-primary {
		color: var(--mdc-theme-text-primary-on-dark);
		background-color: var(--mdc-theme-primary);
	}

	.hero-secondary {
		background-color: var(--mdc-theme-background);
		/* color: var(--mdc-theme-text-primary-on-dark); */
	}

	.lookup-container {
		display: inline-block;
	}
</style>
