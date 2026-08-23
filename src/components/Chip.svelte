<script lang="ts">
	import Icon from 'src/components/Icon.svelte';
	import Button, { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import { alertMessage } from '$lib/stores/main';
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	export let label: string;
	export let value: string;
	export let href: string | undefined = undefined;
	export let type: 'text' | 'url' = href ? 'url' : 'text';
	export let ellipsis: boolean = false;
	export let openInNewTab: boolean = true;
	export let className: string | undefined = undefined;

	let icon = writable(type === 'url' ? 'open-in-new' : 'content-copy');

	let resetIconTimeout: ReturnType<typeof setTimeout>;

	onDestroy(() => clearTimeout(resetIconTimeout));

	const action = () => {
		if (type === 'url') {
			if (openInNewTab) window.open(href, '_blank', 'noopener,noreferrer');
			else goto(value);
		} else {
			// The write can reject (denied permission, non-secure context). Confirming the copy
			// before it resolves showed a checkmark for a copy that never happened, and left the
			// rejection unhandled.
			navigator.clipboard
				.writeText(href ?? value)
				.then(() => {
					icon.set('done');
					clearTimeout(resetIconTimeout);
					resetIconTimeout = setTimeout(() => icon.set('content-copy'), 1000);
				})
				.catch((error) => {
					console.error('Failed to copy to the clipboard', error);
					alertMessage.set('Could not copy to the clipboard');
				});
		}
	};

	export { className as class };
</script>

<Button on:click={action} variant="outlined" class={`chip ${className || ''}`}>
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
		max-width: 100%;

		// mdc-button is a flex container and its label a flex item; both default to
		// min-width: auto, which would hold the chip open at the value's full text
		// width and defeat the max-width above.
		:global(.mdc-button__label) {
			min-width: 0;
		}

		.container {
			display: flex;
			justify-content: center;
			min-width: 0;

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
				// Shrink below content width rather than forcing the chip — and the document —
				// wider than the viewport. Without this a 280px "Expires" chip made /domain
				// scroll sideways at 320px.
				min-width: 0;

				&.ellipsis {
					// Was a hard 100px at every viewport, which cut a 42-char owner address to
					// eleven characters on a 1440px screen. Give it the room it has.
					display: inline-block;
					max-width: min(28ch, 60vw);
				}
			}
		}
	}
</style>
