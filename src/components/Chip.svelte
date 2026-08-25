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

	// Text of the persistent status region below. Kept as state, not mounted/unmounted: an
	// insertion-based announcement (the old `{#if $icon === 'done'}` ping) races the screen
	// reader's queue and can go unheard — see DomainSearch.svelte for the same doctrine.
	let copyStatus = '';

	let resetIconTimeout: ReturnType<typeof setTimeout>;

	// The failure path is announced already — it goes through `alertMessage` into the snackbar,
	// whose surface is a `role="status"` region. Success had no announcement at all: the only
	// signal was the icon swapping to a checkmark, which nothing reads aloud. The status region
	// in the markup below carries the confirmation instead.

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
					copyStatus = 'Copied to the clipboard';
					clearTimeout(resetIconTimeout);
					resetIconTimeout = setTimeout(resetIcon, 1000);
				})
				.catch((error) => {
					console.error('Failed to copy to the clipboard', error);
					alertMessage.set('Could not copy to the clipboard');
				});
		}
	};

	const resetIcon = () => {
		icon.set('content-copy');
		// Cleared rather than left dangling: the region stays in the DOM, so stale text would be
		// re-read on the chip's next focus pass instead of announcing a fresh copy.
		copyStatus = '';
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
	<!-- Persistent, not mounted with the icon: an empty live region that exists from mount is
	     reliably announced when its text changes, while a region inserted on success races the
	     screen reader's queue (the anti-pattern documented in DomainSearch.svelte). -->
	<span class="sr-only" role="status">{copyStatus}</span>
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
		// Load-bearing: without this cap the widest chip ("Expires" on /domain, "Owner" on
		// /tld) lays itself out at 314px and takes both routes to 362px of scroll width in a
		// 320px viewport.
		max-width: 100%;

		// Not what sets the chip's width — the cap above does that. mdc-button is a flex
		// container and its label a flex item defaulting to min-width: auto, so under that cap
		// the label refuses to shrink and spills its contents out of an unchanged 224px chip:
		// the value's right edge moves from 240px to 288px and the trailing icon from x=248 to
		// x=296, both past the chip's own right edge at 272px.
		:global(.mdc-button__label) {
			min-width: 0;
		}

		.container {
			display: flex;
			justify-content: center;

			.label {
				font-weight: bold;
			}

			.value {
				margin-left: 0.5rem;
				color: var(--mdc-theme-text-primary-on-background);
				// Doubles as what lets this flex item shrink past its text width: per CSS Flexbox
				// §4.5 the automatic minimum size only applies while overflow is visible in the
				// main axis, so min-width: auto already resolves to 0 here. Restoring
				// `overflow: visible` takes /domain to 456px of scroll width at 320px.
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				text-transform: none;

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
