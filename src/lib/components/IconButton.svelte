<script lang="ts">
	/**
	 * Custom IconButton component using design tokens
	 * Drop-in replacement for SMUI IconButton
	 * 
	 * Usage:
	 * <IconButton icon="close" title="Close" />
	 * <IconButton on:click={handleClick}>Icon</IconButton>
	 */

	export let icon: string = '';
	export let title: string = '';
	export let ariaLabel: string = '';
	export let disabled: boolean = false;
	export let className: string = '';
	export let size: 'small' | 'medium' | 'large' = 'medium';
</script>

<button
	class="icon-button {className}"
	class:disabled
	class:small={size === 'small'}
	class:large={size === 'large'}
	title={title || ariaLabel}
	aria-label={ariaLabel || title}
	{disabled}
	on:click
	on:keydown
	{...$$restProps}
>
	{#if icon}
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			{#if icon === 'close'}
				<path d="M18 6L6 18M6 6l12 12"/>
			{:else if icon === 'menu'}
				<path d="M3 12h18M3 6h18M3 18h18"/>
			{:else if icon === 'arrow-back'}
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			{:else if icon === 'home'}
				<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
			{:else if icon === 'settings'}
				<path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
				<circle cx="12" cy="12" r="3"/>
			{:else if icon === 'search'}
				<circle cx="11" cy="11" r="8"/>
				<path d="M21 21l-4.35-4.35"/>
			{:else if icon === 'notifications'}
				<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
			{:else}
				<!-- Default icon placeholder -->
				<circle cx="12" cy="12" r="10"/>
			{/if}
		</svg>
	{:else}
		<slot />
	{/if}
</button>

<style>
	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-full);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.icon-button:hover:not(.disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
	}

	.icon-button:active:not(.disabled) {
		transform: scale(0.95);
	}

	.icon-button:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.icon-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Size variants */
	.icon-button.small {
		width: 32px;
		height: 32px;
	}

	.icon-button.small :global(svg) {
		width: 18px;
		height: 18px;
	}

	.icon-button.large {
		width: 48px;
		height: 48px;
	}

	.icon-button.large :global(svg) {
		width: 28px;
		height: 28px;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.icon-button {
			transition: none;
		}
	}
</style>
