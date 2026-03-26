<script lang="ts">
	import Icon from 'src/components/Icon.svelte';
	import Button, { Label } from '@smui/button';
	import { goto } from '$app/navigation';

	interface Props {
		label: string;
		value: string;
		href?: string | undefined;
		type?: 'text' | 'url';
		ellipsis?: boolean;
		openInNewTab?: boolean;
		class?: string | undefined;
	}

	let {
		label,
		value,
		href = undefined,
		type = href ? 'url' : 'text',
		ellipsis = false,
		openInNewTab = true,
		class: className = undefined
	}: Props = $props();

	let iconName = $state(type === 'url' ? 'open-in-new' : 'content-copy');

	function action() {
		if (type === 'url') {
			if (openInNewTab) window.open(href, '_blank');
			else goto(value);
		} else {
			navigator.clipboard.writeText(href ?? value);
			iconName = 'done';
			setTimeout(() => (iconName = 'content-copy'), 1000);
		}
	}
</script>

<Button onclick={action} variant="outlined" class={`chip ${className || ''}`}>
	<Label>
		<div class="container">
			<span class="label">{label}</span>
			<span class="value" class:ellipsis>{value}</span>
		</div>
	</Label>
	{#if iconName === 'done'}
		<Icon icon="done" align="right" />
	{:else if iconName === 'open-in-new'}
		<Icon icon="open-in-new" align="right" />
	{:else if iconName === 'content-copy'}
		<Icon icon="content-copy" align="right" />
	{/if}
</Button>

<style lang="scss">
	:global(.chip) {
		.container {
			display: flex;
			justify-content: center;

			.label {
				font-weight: bold;
			}

			.value {
				margin-left: 0.5rem;
				color: var(--mdc-theme-text-primary-on-background);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				text-transform: none;

				&.ellipsis {
					display: inline-block;
					width: 100px;
				}

				@media (max-width: 768px) {
					max-width: 200px;
					overflow-wrap: anywhere;
				}
			}
		}
	}
</style>
