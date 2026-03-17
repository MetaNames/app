<script lang="ts">
	export let onClick: (() => void) | undefined = undefined;
</script>

<button class="menu-item" on:click={onClick} type="button">
	<slot />
</button>

<style>
	.menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px 14px;
		border: none;
		background: transparent;
		color: rgba(255, 255, 255, 0.85);
		font-family: 'Plus Jakarta Sans', sans-serif;
		font-size: 14px;
		text-align: left;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
	}

	.menu-item:hover {
		background: rgba(104, 73, 254, 0.2);
		color: #fff;
	}

	.menu-item:active {
		background: rgba(104, 73, 254, 0.3);
	}
</style>
