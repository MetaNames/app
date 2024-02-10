<script lang="ts">
	import { RecordClassEnum, type Domain } from '@metanames/sdk';

	import Records from 'src/components/Records.svelte';

	import Card, { Content as CardContent } from '@smui/card';
	import Paper, { Content } from '@smui/paper';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';
	import { toSvg } from 'jdenticon';
	import { config, formatDate } from '$lib';
	import Chip from 'src/components/Chip.svelte';

	export let domain: Domain;
	export let isTld: boolean = false;

	$: domainAvatar = domain.name && toSvg(domain.name, 200);
	$: domainName = isTld ? domain.nameWithoutTLD : domain.name;
	$: hasSocialRecords = Array.from(domain.records.keys()).some(v => socialRecords.includes(v));

	const socialRecords = [RecordClassEnum.Twitter, RecordClassEnum.Discord, RecordClassEnum.Uri].map(v => RecordClassEnum[v]);
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
					<div class="container">
						<div class="row">
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
						{#if hasSocialRecords}
						<div class="row mt-3">
							<h5>Social</h5>
							{#each socialRecords as klass}
								{#if domain.records.get(klass)}
									<Chip label={klass} value={domain.records.get(klass)?.toString() ?? ''} />
								{/if}
							{/each}
						</div>
						{/if}
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
