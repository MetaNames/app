<script lang="ts">
	/**
	 * Custom Snackbar component using design tokens
	 * Drop-in replacement for SMUI Snackbar
	 * 
	 * Usage:
	 * <Snackbar bind:open timeoutMs={5000}>
	 *   <div slot="label">Message</div>
	 *   <div slot="actions">
	 *     <button on:click={handleAction}>Action</button>
	 *   </div>
	 * </Snackbar>
	 */

	import { onMount, createEventDispatcher } from 'svelte';

	export let open: boolean = false;
	export let timeoutMs: number = 5000;
	export let className: string = '';

	const dispatch = createEventDispatcher();

	let timeout: ReturnType<typeof setTimeout>;

	$: if (open && timeoutMs > 0) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			close();
		}, timeoutMs);
	}

	export function openSnackbar() {
		open = true;
	}

	export function close() {
		open = false;
		dispatch('close');
	}

	function handleActionClick() {
		dispatch('action');
		close();
	}

	function handleCloseClick() {
		close();
	}

	onMount(() => {
		return () => clearTimeout(timeout);
	});
</script>

{#if open}
	<div class="snackbar-container">
		<div class="snackbar {className}" role="alert" aria-live="polite">
			<div class="snackbar-label">
				<slot name="label">
					<slot />
				</slot>
			</div>
			<div class="snackbar-actions">
				<slot name="actions">
					<button class="snackbar-close" on:click={handleCloseClick} aria-label="Close">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 6L6 18M6 6l12 12"/>
						</svg>
					</button>
				</slot>
			</div>
		</div>
	</div>
{/if}

<style>
	.snackbar-container {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		padding: 0 1rem;
	}

	.snackbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-width: 300px;
		max-width: 500px;
		padding: 1rem 1.25rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		animation: slideUp 0.3s ease-out;
	}

	.snackbar-label {
		flex: 1;
		font-size: 0.875rem;
		color: var(--text-primary);
	}

	.snackbar-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.snackbar-actions :global(button) {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--primary);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.snackbar-actions :global(button:hover) {
		background: rgba(104, 73, 254, 0.1);
	}

	.snackbar-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		color: var(--text-muted);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: color 0.2s ease, background 0.2s ease;
	}

	.snackbar-close:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.1);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(1rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.snackbar-container {
			bottom: 1rem;
			left: 1rem;
			right: 1rem;
			transform: none;
			padding: 0;
		}

		.snackbar {
			min-width: auto;
			width: 100%;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.snackbar {
			animation: none;
		}
	}
</style>
