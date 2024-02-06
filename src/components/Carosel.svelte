<script lang="ts">
	import Siema from 'siema';
	import { onMount, createEventDispatcher } from 'svelte';

	export let perPage = 3;
	export let loop = true;
	export let autoplay = 0;
	export let duration = 200;
	export let easing = 'ease-out';
	export let startIndex = 0;
	export let draggable = true;
	export let multipleDrag = true;
	export let controls = true;
	export let threshold = 20;
	export let rtl = false;

	let siema: HTMLDivElement;
	let controller: Siema;
	let timer: NodeJS.Timeout;
	const dispatch = createEventDispatcher();

	onMount(() => {
		controller = new Siema({
			selector: siema,
			perPage: typeof perPage === 'object' ? perPage : Number(perPage),
			loop,
			duration,
			easing,
			startIndex,
			draggable,
			multipleDrag,
			threshold,
			rtl,
			onChange: handleChange
		});

		if (autoplay) timer = setInterval(right, autoplay);

		return () => {
			autoplay && clearInterval(timer);
			controller.destroy();
		};
	});

	export function left() {
		controller.prev();
	}

	export function right() {
		controller.next();
	}

	export function go(index: number) {
		controller.goTo(index);
	}

	export function pause() {
		clearInterval(timer);
	}

	export function resume() {
		if (autoplay) {
			timer = setInterval(right, autoplay);
		}
	}

	function handleChange() {
		dispatch('change', {
			currentSlide: controller.currentSlide,
			slideCount: siema.children.length
		});
	}

	function resetInterval(node: HTMLButtonElement, condition: number) {
		function handleReset() {
			pause();
			resume();
		}

		if (condition) {
			node.addEventListener('click', handleReset);
		}

		return {
			destroy() {
				node.removeEventListener('click', handleReset);
			}
		};
	}
</script>

<div class="carousel">
	<div class="slides" bind:this={siema}>
		<slot />
	</div>
	{#if controls}
		<button class="left" on:click={left} use:resetInterval={autoplay} aria-label="left">
			<slot name="left-control" />
		</button>
		<button class="right" on:click={right} use:resetInterval={autoplay} aria-label="right">
			<slot name="right-control" />
		</button>
	{/if}
</div>

<style>
	.carousel {
		position: relative;
		width: 100%;
		justify-content: center;
		align-items: center;
	}

	button {
		position: absolute;
		width: 40px;
		height: 40px;
		top: 50%;
		z-index: 50;
		margin-top: -20px;
		border: none;
		background-color: transparent;
	}
	button:focus {
		outline: none;
	}

	.left {
		left: 2vw;
	}

	.right {
		right: 2vw;
	}
</style>
