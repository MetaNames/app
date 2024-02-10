<script lang="ts">
	import type { Domain } from '@metanames/sdk/lib/models/domain';

	import Records from 'src/components/Records.svelte';
	import Chip from 'src/components/Chip.svelte';

	import Card, { Content as CardContent } from '@smui/card';
	import Paper, { Content } from '@smui/paper';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { toSvg } from 'jdenticon';
	import { config, formatDate } from '$lib';

	$: domainAvatar = domain.name && toSvg(domain.name, 200);
	$: domainName = isTld ? domain.nameWithoutTLD : domain.name;

	export let domain: Domain;
	export let isTld: boolean = false;

	const records = Object.fromEntries(
		[...domain.records].map(([key, value]) => [key, value.toString()])
	);

	const ownerBrowserUrl = `${config.browserUrl}/${isTld ? 'contracts' : 'accounts'}/${
		domain.owner
	}`;

	let tabs = ['Details'];
	if (!isTld) tabs.push('Records');

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
					<div class="mt-1">
						{#if !isTld}
							<Chip iconName="supervisor_account" label="Parent">
								{#if domain.parentId}
									<a href={`/domain/${domain.parentId}`} target="_blank">
										{domain.parentId}
									</a>
								{:else}
									<a href="/tld" target="_blank">meta</a>
								{/if}
							</Chip>
						{/if}
					</div>
					<div class="mt-1">
						<Chip iconName="person" label="Owner">
							<a href={ownerBrowserUrl} target="_blank">{domain.owner}</a>
						</Chip>
					</div>
					{#if !isTld}
						<div class="mt-1">
							<Chip iconName="schedule" label="Created">
								{formatDate(domain.createdAt)}
							</Chip>
						</div>
						<div class="mt-1">
							<Chip iconName="schedule" label="Expires">
								{domain.expiresAt ? formatDate(domain.expiresAt) : 'Never'}
							</Chip>
						</div>
					{/if}
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
	:global(.domain-container) {
		width: 100%;
	}

	.avatar {
		overflow: hidden;

		& .svg {
			display: flex;
			justify-content: center;
		}
	}

	.domain {
		margin-top: 0rem;
		margin-bottom: 1rem;
		font-size: 1.8rem;
		font-weight: 800;
		word-wrap: break-word;
	}
</style>
