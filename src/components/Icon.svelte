<script lang="ts">
	import Icon from '@iconify/svelte';

	let align: 'left' | 'right' | undefined = undefined;
	let key: string;

	const icon = `ic:baseline-${key}`;
	let width = '1.125rem';
	let height = '1.125rem';
	let color: string | undefined = undefined;

	let alignClass = '';
	if (align === 'right') {
		alignClass = 'align-icon-right';
	} else if (align === 'left') {
		alignClass = 'align-icon-left';
	}

	export { key as icon, align, width, height, color };
</script>

<Icon class={alignClass} {icon} {height} {width} {color} />

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
