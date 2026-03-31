<script lang="ts">
	import Button from '@smui/button';

	function goBackInHistory() {
		history.back();
	}
</script>

<Button variant="raised" onclick={goBackInHistory}>Go back</Button>
