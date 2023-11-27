<script lang="ts">
	import { browser } from '$app/environment';
	import IconButton from '@smui/icon-button';

	export let theme: 'light' | 'dark';

	$: theme &&
		browser &&
		updateStyles()

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
