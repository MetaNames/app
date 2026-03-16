<script lang="ts">
	/**
	 * Custom TabBar component using design tokens
	 * Drop-in replacement for SMUI Tab/TabBar
	 * 
	 * Usage:
	 * <TabBar {tabs} bind:active={activeTab} />
	 */

	export let tabs: string[] = [];
	export let active: string = '';

	function selectTab(tab: string) {
		active = tab;
	}
</script>

<div class="tab-bar">
	{#each tabs as tab}
		<button 
			class="tab" 
			class:active={active === tab}
			on:click={() => selectTab(tab)}
		>
			{tab}
		</button>
	{/each}
</div>

<style>
	.tab-bar {
		display: flex;
		gap: 0.5rem;
		border-bottom: 1px solid var(--border);
		margin-bottom: 1rem;
	}

	.tab {
		background: transparent;
		border: none;
		padding: 0.75rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		position: relative;
		transition: all var(--transition-fast);
		font-family: inherit;
	}

	.tab:hover {
		color: var(--text-primary);
	}

	.tab.active {
		color: var(--primary);
	}

	.tab.active::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--primary);
		border-radius: 2px 2px 0 0;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.tab {
			transition: none;
		}
	}
</style>
