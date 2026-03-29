<script lang="ts">
	import Icon from '@iconify/svelte';

	interface Props {
		align?: 'left' | 'right' | undefined;
		icon: string;
		width?: string;
		height?: string;
		color?: string | undefined;
		[key: string]: unknown;
	}

	let {
		align = undefined,
		icon,
		width = '1.125rem',
		height = '1.125rem',
		color = undefined,
		...rest
	}: Props = $props();

	let fullIcon = $derived(`ic:baseline-${icon}`);
	let alignClass = $derived(
		align === 'right' ? 'align-icon-right' : align === 'left' ? 'align-icon-left' : ''
	);
</script>

<Icon class={alignClass} icon={fullIcon} {height} {width} {color} {...rest} />

<style>
	:global(.align-icon-right) {
		margin-left: 8px;
		margin-right: -4px;
	}

	:global(.align-icon-left) {
		margin-right: 8px;
		margin-left: -4px;
	}
</style>
