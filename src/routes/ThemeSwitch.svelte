<script lang="ts">
	import { browser } from '$app/environment';
	import IconButton from '@smui/icon-button';
	import { onMount } from 'svelte';

	export let theme: 'light' | 'dark' | undefined;

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}

	onMount(() => {
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', ({ matches: isDark }) => {
				theme = isDark ? 'dark' : 'light';
			});
	});
</script>

<div class="layout" data-theme={theme}>
	<IconButton class="material-icons" on:click={toggleTheme}>
		{#if theme === 'light'}
			dark_mode
		{:else}
			light_mode
		{/if}
	</IconButton>
</div>
