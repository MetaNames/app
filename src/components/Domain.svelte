<script lang="ts">
	import type { Domain } from '@metanames/sdk/lib/models/domain';

	import Records from './Records.svelte';

	import Card, { Content as CardContent } from '@smui/card';
	import { Icon } from '@smui/icon-button';
	import Paper, { Content } from '@smui/paper';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { toSvg } from 'jdenticon';
	import Chip from './Chip.svelte';

	$: domainAvatar = domain.name && toSvg(domain.name, 250);
	$: domainName = isTld ? domain.nameWithoutTLD : domain.name;

	export let domain: Domain;
	export let isTld: boolean = false;

	const records = Object.fromEntries(
		[...domain.records].map(([key, value]) => [key, value.toString()])
	);

	let tabs = ['Details', 'Records'];
	let tabActive = 'Details';
</script>

<Card class="domain-container">
	<CardContent>
		<div class="avatar">
			<div class="svg">
				{@html domainAvatar}
			</div>
		</div>
		<h5 class="domain">{domainName}</h5>
		<TabBar {tabs} let:tab bind:active={tabActive}>
			<Tab {tab}>
				<Label>{tab}</Label>
			</Tab>
		</TabBar>

		{#if tabActive === 'Details'}
			<Paper variant="unelevated">
				<Content>
					<div class="details-row">
						{#if !isTld}
							<Chip iconName="supervisor_account" label="Parent">
								{#if domain.parentId}
									<a href={`/domain/${domain.parentId}`}>
										<span class="record-value">{domain.parentId}</span>
									</a>
								{:else}
									<a href="/tld">
										<span class="record-value">meta</span>
									</a>
								{/if}
							</Chip>
						{/if}
					</div>
					<div class="details-row">
						<Chip iconName="person" label="Owner">
							<span class="record-value">{domain.owner}</span>
						</Chip>
					</div>
				</Content>
			</Paper>
		{:else if tabActive === 'Records'}
			<Paper variant="unelevated">
				<Content>
					<Records ownerAddress={domain.owner} {records} repository={domain.recordRepository} />
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

	.domain {
		margin-top: 0rem;
		margin-bottom: 1rem;
		font-size: 2rem;
		font-weight: 800;
	}

	:global(.domain-container) {
		min-width: 50wh;
		width: 100%;
	}

	.details-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-top: 1rem;
	}

	.record-value {
		text-align: left;

		@media screen and (max-width: 600px) {
			max-width: 250px;
			word-wrap: break-word;
			overflow-wrap: break-word;
		}
	}
</style>
