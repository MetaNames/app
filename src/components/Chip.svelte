<script lang="ts">
	import Icon from 'src/components/Icon.svelte';
	import Button, { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';

	let {
		label,
		value,
		href = undefined,
		type: explicitType = undefined,
		ellipsis = false,
		openInNewTab = true,
		class: className = undefined
	}: {
		label: string;
		value: string;
		href?: string | undefined;
		type?: 'text' | 'url';
		ellipsis?: boolean;
		openInNewTab?: boolean;
		class?: string | undefined;
	} = $props();

	let computedType = $derived(explicitType ?? (href ? 'url' : 'text'));

	let icon = writable(computedType === 'url' ? 'open-in-new' : 'content-copy');

	const action = () => {
		if (computedType === 'url') {
			if (openInNewTab) window.open(href, '_blank');
			else goto(value);
		} else {
			navigator.clipboard.writeText(href ?? value);
			icon.set('done');
			setTimeout(() => icon.set('content-copy'), 1000);
		}
	};
</script>

<Button onclick={action} variant="outlined" class={`chip ${className || ''}`}>
	<Label>
		<div class="container">
			<span class="label">{label}</span>
			<span class="value" class:ellipsis>{value}</span>
		</div>
	</Label>
	{#if $icon === 'done'}
		<Icon icon="done" align="right" />
	{:else if $icon === 'open-in-new'}
		<Icon icon="open-in-new" align="right" />
	{:else if $icon === 'content-copy'}
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
