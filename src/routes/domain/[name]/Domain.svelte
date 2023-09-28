<script lang="ts">
	import type { Domain } from '@metanames/sdk/lib/models/domain';

	import Records from './Records.svelte';

	import Card, { Content as CardContent } from '@smui/card';
	import { Icon } from '@smui/icon-button';
	import Paper, { Content } from '@smui/paper';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { toSvg } from 'jdenticon';

	$: domainAvatar = domain.name && toSvg(domain.name, 250);

	export let domain: Domain;

	const records = Object.fromEntries(
		[...domain.records].map(([key, value]) => [key, value.toString()])
	);

	let tabs = ['Details', 'Records'];
	let tabActive = 'Details';
</script>

<Card class="w-100">
	<CardContent>
		<div class="avatar">
			<div class="svg">
				{@html domainAvatar}
			</div>
		</div>
		<h5 class="domain">{domain.name}</h5>
		<TabBar {tabs} let:tab bind:active={tabActive}>
			<Tab {tab}>
				<Label>{tab}</Label>
			</Tab>
		</TabBar>

		{#if tabActive === 'Details'}
			<Paper variant="unelevated">
				<Content>
					<div class="details-row">
						<span class="icon">
							<Icon class="material-icons" aria-label="Parent">supervisor_account</Icon>
						</span>
						{#if domain.parentId}
							<a href={`/domain/${domain.parentId}`}>{domain.parentId}</a>
						{:else}
							<div>Parent not present</div>
						{/if}
					</div>
					<div class="details-row">
						<span class="icon">
							<Icon class="material-icons" aria-label="Owner">person</Icon>
						</span>
						<span>{domain.owner}</span>
					</div>
				</Content>
			</Paper>
		{:else if tabActive === 'Records'}
			<Paper variant="unelevated">
				<Content>
					<Records {records} repository={domain.recordRepository} />
				</Content>
			</Paper>
		{/if}
	</CardContent>
</Card>

<style lang="scss">
	.avatar {
		height: 100%;
		width: 100%;
		overflow: hidden;

		& .svg {
			display: flex;
			justify-content: center;
		}
	}

	.icon {
		padding: 0.5rem;
	}

	.domain {
		margin-top: 0rem;
		margin-bottom: 1rem;
		font-size: 2rem;
		font-weight: 800;
	}

	.details-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 1rem;
	}
</style>
