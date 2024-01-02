<script lang="ts">
	import Button from '@smui/button';

	function goBackInHistory() {
		history.back();
	}
</script>

<Button variant="raised" on:click={goBackInHistory}>Go back</Button>
