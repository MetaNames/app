<script lang="ts">
	import { Icon } from '@smui/icon-button';

	export let iconName: string;
	export let label: string;
</script>

<div class="chip">
	<span class="header">
		<div class="icon">
			<Icon class="material-icons" aria-label={iconName}>{iconName}</Icon>
		</div>
		<span>{label}</span>
	</span>
	<div class="content">
		<slot />
	</div>
</div>

<style lang="scss">
	.chip {
		display: flex;
		flex-direction: row;
		align-items: center;

		.header {
			display: flex;
			align-items: center;
			padding: 0.5rem;

			span {
				font-weight: bold;
			}

			.icon {
				margin-right: 0.5rem;
			}
		}

		.content {
			padding: 0.5rem;
			margin-left: 0.5rem;
		}
	}
</style>
