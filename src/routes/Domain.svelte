<script lang="ts">
	import type { Domain } from '@metanames/sdk/lib/models/domain';

	import Card, { Content as CardContent, MediaContent } from '@smui/card';
	import Media from '@smui/card/src/Media.svelte';
	import { Icon } from '@smui/icon-button';
	import Paper, { Content } from '@smui/paper';
	import Select, { Option } from '@smui/select';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';

	import { toSvg } from 'jdenticon';

	$: domainAvatar = domain.name && toSvg(domain.name, 250);

	export let domain: Domain;

	let selectedRecord: string;
	let tabs = ['Details', 'Records'];
	let tabActive = 'Details';
</script>

<Card>
	<Media aspectRatio="16x9">
		<MediaContent>
			<div class="avatar">
				<div class="svg">
					{@html domainAvatar}
				</div>
			</div>
		</MediaContent>
	</Media>
	<CardContent>
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
						<div>{domain.parentId || 'Parent not present'}</div>
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
					<h6>Records</h6>
					<formgroup>
						<Select bind:value={selectedRecord} label="Record type" variant="outlined">
							{#each domain.records as [key]}
								<Option value={key}>{key}</Option>
							{/each}
						</Select>
					</formgroup>
					{#if selectedRecord}
						<div class="value-container">
							<p>Value</p>
							<span>{domain.records.get(selectedRecord)}</span>
						</div>
					{/if}
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
	h6 {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
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

	.value-container {
		margin-top: 1rem;

		> span {
			font-family: monospace;
			word-wrap: break-word;
		}
	}
</style>
