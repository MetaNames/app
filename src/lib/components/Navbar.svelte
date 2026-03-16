<script lang="ts">
	/**
	 * Custom Navbar component using design tokens
	 * Drop-in replacement for SMUI TopAppBar
	 * 
	 * Usage:
	 * <Navbar>
	 *   <div slot="start">Logo</div>
	 *   <div slot="end">Actions</div>
	 * </Navbar>
	 */

	export let variant: 'static' | 'short' | 'shortCollapsed' | 'medium' | 'prominent' = 'static';
	export let dense: boolean = false;
	export let className: string = '';
</script>

<header class="navbar navbar-{variant} {className}" class:dense>
	<div class="navbar-inner">
		<div class="navbar-start">
			<slot name="start" />
		</div>
		<div class="navbar-center">
			<slot name="center" />
		</div>
		<div class="navbar-end">
			<slot name="end" />
		</div>
	</div>
</header>

<style>
	.navbar {
		position: relative;
		width: 100%;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		border-bottom: 1px solid var(--glass-border);
		z-index: 1000;
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1rem;
		max-width: 1280px;
		margin: 0 auto;
		height: 64px;
	}

	.navbar-start {
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: flex-start;
	}

	.navbar-center {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 2;
	}

	.navbar-end {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex: 1;
		gap: 0.5rem;
	}

	/* Dense variant */
	.dense .navbar-inner {
		height: 48px;
	}

	/* Short variant */
	.navbar-short .navbar-inner,
	.navbar-shortCollapsed .navbar-inner {
		height: 48px;
	}

	/* Prominent variant */
	.navbar-prominent .navbar-inner {
		height: 96px;
	}

	/* Medium variant */
	.navbar-medium .navbar-inner {
		height: 80px;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.navbar-inner {
			padding: 0 0.75rem;
			height: 56px;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.navbar {
			transition: none;
		}
	}
</style>
