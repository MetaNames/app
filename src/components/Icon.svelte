<script lang="ts">
	import Icon from '@iconify/svelte';

	let align: 'left' | 'right' | undefined = undefined;
	let key: string;

	let width = '1.125rem';
	let height = '1.125rem';
	let color: string | undefined = undefined;

	export { key as icon, align, width, height, color };

	$: icon = `ic:baseline-${key}`;
	$: alignClass =
		align === 'right' ? 'align-icon-right' : align === 'left' ? 'align-icon-left' : '';
</script>

<Icon class={alignClass} {icon} {height} {width} {color} {...$$restProps} />

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
