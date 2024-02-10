<script lang="ts">
	import { Icon } from '@smui/icon-button';
	import Button, { Label } from '@smui/button';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';

	export let label: string;
	export let value: string;
	export let href: string | undefined = undefined;
	export let type: 'text' | 'url' = href ? 'url' : 'text';
	export let ellipsis: boolean = false;
	export let openInNewTab: boolean = true;
	export let className: string | undefined = undefined;

	let icon = writable(type === 'url' ? 'open_in_new' : 'content_copy');

	const action = () => {
		if (type === 'url') {
			if (openInNewTab) window.open(href, '_blank');
			else goto(value);
		} else {
			navigator.clipboard.writeText(value);
			icon.set('done');
			setTimeout(() => icon.set('content_copy'), 1000);
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
	<Icon class="material-icons">{$icon}</Icon>
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
