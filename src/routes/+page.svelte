<script lang="ts">
	import LookUp from './LookUp.svelte';
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="content">
	<h3>Find your Meta Name</h3>
	<p>Choose your decentralised name to use it for wallets, social, websites, and more!</p>
	<div class="lookup-container">
		<LookUp />
	</div>
</div>

<style lang="scss">
	h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.lookup-container {
		display: inline-block;
	}

	.content {
		align-self: center;
		flex-grow: 1;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
