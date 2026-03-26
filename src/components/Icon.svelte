<script lang="ts">
	import Icon from '@iconify/svelte';


	const icon = `ic:baseline-${key}`;
	interface Props {
		align?: 'left' | 'right' | undefined;
		icon: string;
		width?: string;
		height?: string;
		color?: string | undefined;
		[key: string]: any
	}

	let {
		align = undefined,
		icon: key,
		width = '1.125rem',
		height = '1.125rem',
		color = undefined,
		...rest
	}: Props = $props();

	let alignClass = $state('');
	if (align === 'right') {
		alignClass = 'align-icon-right';
	} else if (align === 'left') {
		alignClass = 'align-icon-left';
	}

	
</script>

<Icon class={alignClass} {icon} {height} {width} {color} {...rest} />

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
