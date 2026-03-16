<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	function goBackInHistory() {
		history.back();
	}
</script>

<Button variant="primary" on:click={goBackInHistory}>Go back</Button>
