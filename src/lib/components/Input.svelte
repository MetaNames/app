<script lang="ts">
	/**
	 * Custom Input component using design tokens
	 * Drop-in replacement for SMUI Textfield
	 * 
	 * Usage:
	 * <Input 
	 *   placeholder="Enter domain..." 
	 *   bind:value={value}
	 *   error="Error message"
	 * />
	 */

	export let placeholder: string = '';
	export let value: string = '';
	export let disabled: boolean = false;
	export let error: string = '';
	export let helperText: string = '';
	export let label: string = '';
	export let id: string = '';
	export let name: string = '';
	export let required: boolean = false;
	export let className: string = '';
	export let inputClass: string = '';
	export let variant: 'outlined' | 'filled' | 'standard' = 'outlined';
	export let invalid: boolean = false;
	export let autofocus: boolean = false;

	let inputElement: HTMLInputElement;

	// Auto-compute invalid from error
	$: invalid = !!error;

	export function focus() {
		inputElement?.focus();
	}

	export function blur() {
		inputElement?.blur();
	}
</script>

<div class="input-wrapper {className}" class:has-error={invalid} class:disabled>
	{#if label}
		<label for={id} class="label">
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}
	
	<div class="input-container input-{variant}">
		<slot name="prefix" />
		<input
			bind:this={inputElement}
			{id}
			{name}
			type="text"
			{placeholder}
			{disabled}
			{required}
			bind:value
			class="input {inputClass}"
			on:input
			on:change
			on:focus
			on:blur
			on:keydown
			{autofocus}
			{...$$restProps}
		/>
		<slot name="suffix" />
		<slot name="trailingIcon" />
	</div>

	{#if error}
		<span class="helper-text error">{error}</span>
	{:else if helperText}
		<span class="helper-text">{helperText}</span>
	{/if}
	<slot name="helper" />
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
	}

	.label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.required {
		color: #ef4444;
		margin-left: 2px;
	}

	.input-container {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		transition: all var(--transition-normal);
		overflow: hidden;
	}

	.input-container:focus-within {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(104, 73, 254, 0.2);
	}

	.has-error .input-container {
		border-color: #ef4444;
	}

	.has-error .input-container:focus-within {
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
	}

	/* Variants */
	.input-outlined {
		background: transparent;
	}

	.input-filled {
		background: rgba(255, 255, 255, 0.1);
		border-color: transparent;
	}

	.input-filled:focus-within {
		background: rgba(255, 255, 255, 0.15);
	}

	.input-standard {
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--border);
		border-radius: 0;
	}

	.input-standard:focus-within {
		border-color: var(--primary);
		box-shadow: 0 2px 0 2px rgba(104, 73, 254, 0.2);
	}

	.input {
		flex: 1;
		background: transparent;
		border: none;
		padding: 0.75rem 1rem;
		color: var(--text-primary);
		font-size: 1rem;
		font-family: inherit;
		outline: none;
		width: 100%;
		min-width: 0;
	}

	.input::placeholder {
		color: var(--text-muted);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Slots */
	.input-container :global(.prefix),
	.input-container :global(.suffix),
	.input-container :global(.trailingIcon) {
		display: flex;
		align-items: center;
		padding: 0 0.75rem;
		color: var(--text-muted);
	}

	.input-container :global(.trailingIcon) {
		cursor: pointer;
	}

	.helper-text {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.helper-text.error {
		color: #ef4444;
	}

	.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.input-container {
			transition: none;
		}
	}
</style>
