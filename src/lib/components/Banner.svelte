<script lang="ts">
	/**
	 * Custom Banner component using design tokens
	 * Drop-in replacement for SMUI Banner
	 * 
	 * Usage:
	 * <Banner open={true}>
	 *   <div slot="icon">...</div>
	 *   <div slot="label">Message</div>
	 *   <div slot="actions">Buttons</div>
	 * </Banner>
	 */

	export let open: boolean = false;
	export let centered: boolean = false;
	export let mobileStacked: boolean = false;
	export let className: string = '';
</script>

{#if open}
	<div 
		class="banner {className}"
		class:centered
		class:mobile-stacked={mobileStacked}
		role="alert"
	>
		<div class="banner-icon">
			<slot name="icon" />
		</div>
		<div class="banner-content">
			<slot name="label" />
		</div>
		<div class="banner-actions">
			<slot name="actions" />
		</div>
	</div>
{/if}

<style>
	.banner {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
		color: white;
	}

	.banner.centered {
		justify-content: center;
	}

	.banner-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.banner-content {
		flex: 1;
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.banner-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	/* Mobile stacked */
	@media (max-width: 768px) {
		.banner.mobile-stacked {
			flex-direction: column;
			text-align: center;
			gap: 0.75rem;
		}

		.banner.mobile-stacked .banner-actions {
			width: 100%;
			justify-content: center;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.banner {
			transition: none;
		}
	}
</style>
