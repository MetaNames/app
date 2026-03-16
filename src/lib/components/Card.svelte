<script lang="ts">
	/**
	 * Custom Card component using design tokens
	 * Drop-in replacement for SMUI Card
	 * 
	 * Usage:
	 * <Card variant="glass" hoverable padded>
	 *   Content here
	 * </Card>
	 */

	export let variant: 'glass' | 'solid' | 'outline' = 'glass';
	export let hoverable: boolean = false;
	export let padded: boolean = true;
	export let className: string = '';
</script>

<div 
	class="card card-{variant} {className}"
	class:hoverable
	class:padded
>
	<slot />
</div>

<style>
	.card {
		border-radius: var(--radius-xl);
		transition: all var(--transition-slow);
		position: relative;
		overflow: hidden;
	}

	/* Glass variant - glassmorphism */
	.card-glass {
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border: 1px solid var(--glass-border);
	}

	.card-glass.hoverable:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--border-hover);
		box-shadow: var(--shadow-glow);
		transform: translateY(-2px);
	}

	/* Solid variant */
	.card-solid {
		background: var(--bg-card);
		border: 1px solid var(--border);
	}

	.card-solid.hoverable:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--border-hover);
	}

	/* Outline variant */
	.card-outline {
		background: transparent;
		border: 1px solid var(--border);
	}

	.card-outline.hoverable:hover {
		border-color: var(--border-hover);
		background: rgba(255, 255, 255, 0.03);
	}

	/* Padding */
	.padded {
		padding: 1.5rem;
	}

	/* Hoverable cursor */
	.hoverable {
		cursor: pointer;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
		.card.hoverable:hover {
			transform: none;
		}
	}
</style>
