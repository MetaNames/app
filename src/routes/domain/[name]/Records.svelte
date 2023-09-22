<script lang="ts">
	import type { RecordRepository } from '@metanames/sdk';

	import Button from '@smui/button/src/Button.svelte';

	import RecordComponent from './Record.svelte';
	import { walletConnected } from '$lib/stores';

  $: disabled = !$walletConnected;

	export let records: Record<string, string>;
	export let repository: RecordRepository;
</script>

<div class="records">
	<formgroup>
		{#each Object.keys(records) as key}
			<RecordComponent {repository} klass={key} value={records[key]} />
		{/each}
	</formgroup>
	<formgroup>
		<Button variant="raised" {disabled}>Add record</Button>
	</formgroup>
</div>

<style lang="scss">
	.records {
		display: flex;
		flex-direction: column;
		align-items: center;

		& formgroup {
			margin: 0.5rem 0;
		}
	}
</style>
