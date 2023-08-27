<script lang="ts">
	import LookUp from './LookUp.svelte';

	import '../styles/hero.scss';
</script>

<svelte:head>
	<title>Meta Names</title>
</svelte:head>

<div class="hero-secondary">
	<div class="content">
		<h3>Find your Meta Name</h3>
		<p>Choose your decentralised name to use it for wallets, social, websites, and more!</p>
		<div class="lookup-container">
			<LookUp />
		</div>
	</div>
</div>

<style lang="scss">
	.lookup-container {
		display: inline-block;
	}
</style>
