<script lang="ts">
	export let value: string;
	export let disabled: boolean = false;
</script>

<option {value} {disabled}>
	<slot>{value}</slot>
</option>

<style>
	option {
		background: #1a1a2e;
		color: white;
		padding: 8px;
	}
</style>
