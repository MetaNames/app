<script lang="ts">
	import { browser } from '$app/environment';
	import IconButton from '@smui/icon-button';
	import { onMount } from 'svelte';

	const storageKey = 'user-theme';

	export let theme: 'light' | 'dark';

	$: theme &&
		browser &&
		updateStyles() &&
		window.localStorage.setItem(storageKey, JSON.stringify(theme));

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}

	function updateStyles() {
		// Get the theme stylesheet link elements
		const lightThemeStylesheet = document.getElementById('light-theme-asset') as HTMLLinkElement;
		const darkThemeStylesheet = document.getElementById('dark-theme-asset') as HTMLLinkElement;

		if (!lightThemeStylesheet || !darkThemeStylesheet) return;

		if (theme === 'dark') {
			darkThemeStylesheet.media = 'screen';
			lightThemeStylesheet.media = 'not all';
		} else if (theme === 'light') {
			lightThemeStylesheet.media = 'all';
			darkThemeStylesheet.media = 'not all';
		}

		return true;
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
