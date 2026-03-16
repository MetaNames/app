<script lang="ts">
	/**
	 * Custom Dialog component using design tokens
	 * Drop-in replacement for SMUI Dialog
	 * 
	 * Usage:
	 * <Dialog bind:open>
	 *   <svelte:fragment slot="title">Title</svelte:fragment>
	 *   Content here
	 *   <svelte:fragment slot="actions">
	 *     <Button on:click={close}>Close</Button>
	 *   </svelte:fragment>
	 * </Dialog>
	 */

	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let open: boolean = false;
	export let heading: string = '';
	export let className: string = '';

	const dispatch = createEventDispatcher();

	function close() {
		open = false;
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			close();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if open}
	<!-- Backdrop -->
	<div 
		class="dialog-backdrop"
		transition:fade={{ duration: 200 }}
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby={heading ? 'dialog-title' : undefined}
	>
		<!-- Dialog Container -->
		<div 
			class="dialog-container {className}"
			transition:scale={{ duration: 200, start: 0.95 }}
			role="document"
		>
			<!-- Header -->
			{#if heading || $$slots.title}
				<div class="dialog-header">
					{#if $$slots.title}
						<slot name="title" />
					{:else}
						<h2 id="dialog-title" class="dialog-title">{heading}</h2>
					{/if}
					<button class="dialog-close" on:click={close} aria-label="Close">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6L6 18M6 6l12 12"/>
						</svg>
					</button>
				</div>
			{/if}

			<!-- Content -->
			<div class="dialog-content">
				<slot />
			</div>

			<!-- Actions -->
			{#if $$slots.actions}
				<div class="dialog-actions">
					<slot name="actions" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		padding: 1rem;
	}

	.dialog-container {
		background: var(--bg-card, rgba(15, 15, 26, 0.95));
		border: 1px solid var(--border);
		border-radius: var(--radius-xl, 1rem);
		box-shadow: var(--shadow-lg);
		max-width: 500px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.dialog-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.dialog-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.dialog-close:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
	}

	.dialog-close:active {
		transform: scale(0.95);
	}

	.dialog-content {
		padding: 1.5rem;
		overflow-y: auto;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.dialog-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border);
		background: rgba(255, 255, 255, 0.02);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.dialog-backdrop,
		.dialog-container {
			transition: none;
		}
	}
</style>
