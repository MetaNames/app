<script lang="ts">
	import Layout from './Layout.svelte';
	import LookUp from './LookUp.svelte';

	import '../styles/hero.scss';
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

<style lang="scss">
	.lookup-container {
		display: inline-block;
	}
</style>
