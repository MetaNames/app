<script lang="ts">
	/**
	 * Custom Radio component using design tokens
	 * 
	 * Usage:
	 * <Radio bind:group={selected} value="yes" label="Yes" />
	 */

	export let group: string;
	export let value: string;
	export let label: string = '';
	export let name: string = '';
	export let disabled: boolean = false;
</script>

<label class="radio-wrapper" class:disabled>
	<input
		type="radio"
		{group}
		{value}
		{name}
		{disabled}
		on:change
		on:focus
		on:blur
		{...$$restProps}
	/>
	<span class="radio-custom"></span>
	{#if label}
		<span class="radio-label">{label}</span>
	{/if}
</label>

<style>
	.radio-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
	}

	.radio-wrapper.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	input[type="radio"] {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.radio-custom {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border);
		border-radius: 50%;
		transition: all var(--transition-normal);
		position: relative;
	}

	input[type="radio"]:checked + .radio-custom {
		border-color: var(--primary);
	}

	input[type="radio"]:checked + .radio-custom::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 10px;
		height: 10px;
		background: var(--primary);
		border-radius: 50%;
	}

	input[type="radio"]:focus-visible + .radio-custom {
		box-shadow: 0 0 0 2px rgba(104, 73, 254, 0.3);
	}

	.radio-wrapper:hover:not(.disabled) .radio-custom {
		border-color: var(--primary-hover);
	}

	.radio-label {
		color: var(--text-primary);
		font-size: 0.875rem;
	}
</style>
