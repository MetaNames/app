<script lang="ts">
	import { onMount } from 'svelte';

	export let open = false;
	export let anchor: HTMLDivElement | undefined = undefined;
	export let anchorCorner: 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'TOP_LEFT' | 'TOP_RIGHT' = 'BOTTOM_LEFT';

	let menuElement: HTMLDivElement;
	let position = { top: 0, left: 0 };

	function updatePosition() {
		if (!anchor || !menuElement) return;

		const anchorRect = anchor.getBoundingClientRect();
		const menuRect = menuElement.getBoundingClientRect();

		const corners = {
			BOTTOM_LEFT: { top: anchorRect.bottom + 4, left: anchorRect.left },
			BOTTOM_RIGHT: { top: anchorRect.bottom + 4, left: anchorRect.right - menuRect.width },
			TOP_LEFT: { top: anchorRect.top - menuRect.height - 4, left: anchorRect.left },
			TOP_RIGHT: { top: anchorRect.top - menuRect.height - 4, left: anchorRect.right - menuRect.width }
		};

		position = corners[anchorCorner];
	}

	$: if (open && anchor) {
		updatePosition();
	}

	onMount(() => {
		const handleResize = () => updatePosition();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function handleClickOutside(event: MouseEvent) {
		if (menuElement && !menuElement.contains(event.target as Node) && !anchor?.contains(event.target as Node)) {
			open = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

{#if open}
	<div
		bind:this={menuElement}
		class="menu"
		style="top: {position.top}px; left: {position.left}px;"
	>
		<slot />
	</div>
{/if}

<style>
	.menu {
		position: fixed;
		z-index: 1000;
		min-width: 180px;
		background: rgba(15, 15, 20, 0.95);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 6px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}
</style>
