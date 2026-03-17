<script lang="ts">
	export let closed = false;
	export let indeterminate = false;
	export let progress = 0;
	export let ariaLabel = 'Loading';
</script>

{#if !closed}
	<div 
		class="linear-progress" 
		class:indeterminate 
		role="progressbar"
		aria-label={ariaLabel}
		aria-valuenow={indeterminate ? undefined : Math.round(progress * 100)}
		aria-valuemin="0"
		aria-valuemax="100"
	>
		<div 
			class="progress-bar" 
			class:indeterminate-bar={indeterminate}
			style:width={indeterminate ? '100%' : `${progress * 100}%`}
		></div>
	</div>
{/if}

<style>
	.linear-progress {
		position: relative;
		width: 100%;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #6849fe, #8b5cf6);
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.progress-bar.indeterminate-bar {
		position: absolute;
		width: 30%;
		animation: indeterminate 1.5s ease-in-out infinite;
	}

	@keyframes indeterminate {
		0% {
			left: -30%;
		}
		100% {
			left: 100%;
		}
	}
</style>
