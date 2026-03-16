<script lang="ts">
	/**
	 * Custom Select component using design tokens
	 * Drop-in replacement for SMUI Select
	 * 
	 * Usage:
	 * <Select 
	 *   bind:value={selected}
	 *   label="Choose option"
	 * >
	 *   <Option value="a">Option A</Option>
	 *   <Option value="b">Option B</Option>
	 * </Select>
	 */

	import { createEventDispatcher } from 'svelte';

	export let value: string = '';
	export let label: string = '';
	export let placeholder: string = 'Select an option...';
	export let disabled: boolean = false;
	export let error: string = '';
	export let id: string = '';
	export let name: string = '';
	export let required: boolean = false;
	export let className: string = '';

	const dispatch = createEventDispatcher();
	let open = false;
	let containerEl: HTMLDivElement;

	function toggle() {
		if (!disabled) {
			open = !open;
		}
	}

	function select(optionValue: string) {
		value = optionValue;
		open = false;
		dispatch('change', value);
	}

	function handleClickOutside(e: MouseEvent) {
		if (containerEl && !containerEl.contains(e.target as Node)) {
			open = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	$: selectedLabel = placeholder;
	$: {
		const slot = $$slots.default?.();
		if (slot && value) {
			for (const s of slot) {
				if (s?.props?.value === value) {
					selectedLabel = s.props.label || s.props.value;
					break;
				}
			}
		}
	}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div 
	class="select-wrapper {className}" 
	class:disabled 
	class:open 
	class:has-error={!!error}
	bind:this={containerEl}
>
	{#if label}
		<label for={id} class="select-label">
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}

	<div class="select-container">
		<button
			type="button"
			class="select-trigger"
			{id}
			{name}
			{disabled}
			{required}
			on:click={toggle}
			on:focus
			on:blur
		>
			<span class="select-value" class:placeholder={!value}>
				{selectedLabel}
			</span>
			<span class="select-arrow">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M6 9l6 6 6-6"/>
				</svg>
			</span>
		</button>

		{#if open}
			<div class="select-dropdown" transition:slide={{ duration: 150 }}>
				<slot />
			</div>
		{/if}
	</div>

	{#if error}
		<span class="helper-text error">{error}</span>
	{/if}
</div>

<style>
	.select-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
		position: relative;
	}

	.select-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.required {
		color: #ef4444;
		margin-left: 2px;
	}

	.select-container {
		position: relative;
	}

	.select-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-size: 1rem;
		font-family: inherit;
		cursor: pointer;
		transition: all var(--transition-normal);
		text-align: left;
	}

	.select-trigger:hover:not(:disabled) {
		border-color: var(--border-hover);
		background: rgba(255, 255, 255, 0.08);
	}

	.select-trigger:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(104, 73, 254, 0.2);
	}

	.select-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.select-value.placeholder {
		color: var(--text-muted);
	}

	.select-arrow {
		display: flex;
		align-items: center;
		color: var(--text-muted);
		transition: transform var(--transition-fast);
	}

	.open .select-arrow {
		transform: rotate(180deg);
	}

	.select-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--bg-card, rgba(15, 15, 26, 0.98));
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 100;
		max-height: 200px;
		overflow-y: auto;
	}

	.select-dropdown :global(.select-option) {
		padding: 0.75rem 1rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.select-dropdown :global(.select-option:hover) {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary);
	}

	.select-dropdown :global(.select-option.selected) {
		background: rgba(104, 73, 254, 0.15);
		color: var(--primary);
	}

	.helper-text {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.helper-text.error {
		color: #ef4444;
	}

	.has-error .select-trigger {
		border-color: #ef4444;
	}

	.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.select-trigger,
		.select-arrow,
		.select-dropdown :global(.select-option) {
			transition: none;
		}
	}
</style>

<script context="module" lang="ts">
	import { slide } from 'svelte/transition';
</script>
