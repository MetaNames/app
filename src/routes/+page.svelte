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
	<Row>
		<Section>
			<IconButton class="material-icons">menu</IconButton>
			<Title>Meta Names</Title>
		</Section>

		<Section align="end" toolbar>
			<IconButton class="material-icons" aria-label="Wallet">wallet</IconButton>
		</Section>
	</Row>
</TopAppBar>

<div class="content">
	<h1>Meta Names</h1>
</div>

<style>
	.content {
		max-width: 960px;
		margin: 0 auto;
		padding: 1em;
	}
</style>
