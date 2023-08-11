<script lang="ts">
	import { Row, Title } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';

	import Section from '@smui/top-app-bar/src/Section.svelte';
	import TopAppBar from '@smui/top-app-bar/src/TopAppBar.svelte';

	let dense = true;
</script>

<svelte:head>
	<title>Meta Names</title>
</svelte:head>

<TopAppBar variant="static" {dense}>
	<div class="topbar-container">
		<Row>
			<Section>
				<IconButton class="material-icons">menu</IconButton>
				<Title>Meta Names</Title>
			</Section>

			<Section align="end" toolbar>
				<IconButton class="material-icons" aria-label="Wallet">wallet</IconButton>
			</Section>
		</Row>
	</div>
</TopAppBar>

<div class="hero hero-primary">
	<div class="content">
		<h1>Meta Names</h1>
		<h5>The only name you need</h5>
	</div>
</div>

<style>
	.topbar-container {
		padding: 0.5rem 0;
	}
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
