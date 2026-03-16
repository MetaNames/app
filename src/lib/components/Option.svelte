<script lang="ts">
	/**
	 * Custom Option component for Select
	 * 
	 * Usage:
	 * <Option value="a" label="Option A" />
	 */

	import { createEventDispatcher } from 'svelte';

	export let value: string = '';
	export let label: string = '';
	export let selected: boolean = false;

	const dispatch = createEventDispatcher();
</script>

<div 
	class="select-option" 
	class:selected
	role="option"
	aria-selected={selected}
	on:click
	on:keypress
	{...$$restProps}
>
	<slot>{label || value}</slot>
</div>
