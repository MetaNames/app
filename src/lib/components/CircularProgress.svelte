<script lang="ts">
	/**
	 * Custom CircularProgress component using design tokens
	 * Drop-in replacement for SMUI CircularProgress
	 * 
	 * Usage:
	 * <CircularProgress color="primary" size={40} />
	 */

	export let color: 'primary' | 'white' = 'primary';
	export let size: number = 40;
	export let strokeWidth: number = 4;
</script>

<div 
	class="circular-progress" 
	class:color-primary={color === 'primary'}
	class:color-white={color === 'white'}
	style="width: {size}px; height: {size}px;"
>
	<svg viewBox="0 0 {size} {size}">
		<circle 
			class="track"
			cx={size / 2} 
			cy={size / 2} 
			r={(size - strokeWidth) / 2}
			stroke-width={strokeWidth}
		/>
		<circle 
			class="progress"
			cx={size / 2} 
			cy={size / 2} 
			r={(size - strokeWidth) / 2}
			stroke-width={strokeWidth}
		/>
	</svg>
</div>

<style>
	.circular-progress {
		display: inline-block;
		animation: rotate 1.4s linear infinite;
	}

	svg {
		width: 100%;
		height: 100%;
	}

	circle {
		fill: none;
		stroke-linecap: round;
		transform: rotate(-90deg);
		transform-origin: center;
	}

	.track {
		opacity: 0.2;
	}

	.progress {
		animation: dash 1.4s ease-in-out infinite;
	}

	/* Primary color */
	.color-primary .track {
		stroke: var(--primary);
	}
	.color-primary .progress {
		stroke: var(--primary);
	}

	/* White color */
	.color-white .track {
		stroke: white;
	}
	.color-white .progress {
		stroke: white;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes dash {
		0% {
			stroke-dasharray: 1, 100;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 70, 100;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 70, 100;
			stroke-dashoffset: -93;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.circular-progress,
		.progress {
			animation: none;
		}
	}
</style>
