<script lang="ts">
	/**
	 * Custom Button component using design tokens
	 * Drop-in replacement for SMUI Button
	 * 
	 * Usage:
	 * <Button variant="primary" disabled={false} on:click={handler}>
	 *   Label
	 * </Button>
	 */

	import { createEventDispatcher } from 'svelte';

	export let variant: 'primary' | 'secondary' | 'text' | 'raised' = 'primary';
	export let disabled: boolean = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let className: string = '';
	export let href: string | undefined = undefined;
	export let loading: boolean = false;

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent) {
		if (!disabled && !loading) {
			dispatch('click', event);
		}
	}
</script>

{#if href && !disabled}
	<a
		{href}
		class="btn btn-{variant} {className}"
		class:disabled
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		class="btn btn-{variant} {className}"
		disabled={disabled || loading}
		on:click={handleClick}
	>
		{#if loading}
			<span class="spinner"></span>
		{/if}
		<span class="content" class:loading>
			<slot />
		</span>
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		border-radius: var(--radius-full);
		transition: all var(--transition-normal);
		cursor: pointer;
		border: none;
		outline: none;
		touch-manipulation: true;
		text-decoration: none;
		position: relative;
		overflow: hidden;
	}

	.btn:focus-visible {
		box-shadow: 0 0 0 2px rgba(104, 73, 254, 0.5);
	}

	/* Primary variant */
	.btn-primary {
		background: var(--primary);
		color: var(--text-primary);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-hover);
		box-shadow: var(--shadow-glow-hover);
		transform: translateY(-2px);
	}

	.btn-primary:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	/* Secondary variant */
	.btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
		border-color: var(--border-hover);
		transform: translateY(-2px);
	}

	.btn-secondary:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	/* Text variant */
	.btn-text {
		background: transparent;
		color: var(--primary);
		padding: 0.75rem 1rem;
	}

	.btn-text:hover:not(:disabled) {
		background: rgba(104, 73, 254, 0.1);
	}

	.btn-text:active:not(:disabled) {
		transform: scale(0.98);
	}

	/* Raised variant - same as primary but with more emphasis */
	.btn-raised {
		background: var(--primary);
		color: var(--text-primary);
		box-shadow: 0 4px 14px rgba(104, 73, 254, 0.4);
	}

	.btn-raised:hover:not(:disabled) {
		background: var(--primary-hover);
		box-shadow: var(--shadow-glow-hover);
		transform: translateY(-2px);
	}

	.btn-raised:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	/* Disabled state */
	.btn:disabled,
	.btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	/* Loading state */
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top-color: currentColor;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-right: 8px;
	}

	.content.loading {
		opacity: 0.7;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
		.spinner {
			animation: none;
		}
	}
</style>
