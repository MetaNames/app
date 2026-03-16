<script lang="ts">
	export let invalid: boolean = false;
	export let className: string = '';
</script>

<p class="helper-text {className}" class:invalid>
	<slot />
</p>

<style>
	.helper-text {
		display: block;
		margin-top: 4px;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		padding: 0 12px;
	}
	
	.helper-text.invalid {
		color: #f44336;
	}
</style>
