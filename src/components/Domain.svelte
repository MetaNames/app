<script lang="ts">
	import type { Domain } from '@metanames/sdk';

	import Records from 'src/components/Records.svelte';

	import Card, { Content as CardContent } from '@smui/card';
	import Paper, { Content } from '@smui/paper';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { toSvg } from 'jdenticon';
	import { config, formatDate } from '$lib';
	import Chip from 'src/components/Chip.svelte';

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

	let tabs: Array<'Profile' | 'Records'> = ['Profile'];
	if (!isTld) tabs.push('Records');

	let tabActive = tabs[0];
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

		{#if tabActive === 'Profile'}
			<Paper variant="unelevated">
				<Content>
					<div class="container">
						<div class="row mt-1">
							<h5>Whois</h5>
							{#if !isTld}
								{#if domain.parentId}
									<Chip
										label="Parent"
										value={domain.parentId}
										href={`/domain/${domain.parentId}`}
									/>
								{:else}
									<Chip label="Parent" value={domain.tld} href="/tld" />
								{/if}
								<Chip
									label="Expires"
									value={domain.expiresAt ? formatDate(domain.expiresAt) : 'Never'}
								/>
							{/if}
							<Chip label="Owner" value={domain.owner} href={ownerBrowserUrl} ellipsis />
						</div>
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
	:global(.domain-container) {
		width: 100%;

		.container {
			display: flex;
			flex-direction: column;
			align-items: start;

			h5 {
				margin-top: 0;
				margin-bottom: 1rem;
				text-align: start;
				font-weight: 800;
				word-wrap: break-word;
			}
		}
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
