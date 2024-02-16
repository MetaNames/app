<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import { toSvg } from 'jdenticon';

	import Card, { Content as CardContent } from '@smui/card';
	import Paper, { Content } from '@smui/paper';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';

	import { config, formatDate, isValidURL, profileRecords, socialRecords } from '$lib';
	import { DomainTab } from 'src/lib/types';
	import Chip from 'src/components/Chip.svelte';
	import Records from 'src/components/Records.svelte';
	import { walletAddress } from 'src/lib/stores/main';
	import { metaNamesSdk } from 'src/lib/stores/sdk';

	export let domain: Domain;
	export let isTld: boolean = false;
	export let activeTab: DomainTab = DomainTab.details;

	$: domainAvatar = domain.name && toSvg(domain.name, 200);
	$: domainName = isTld ? domain.nameWithoutTLD : domain.name;
	$: hasSocialRecords = Object.keys(domain.records).some((v) => socialRecords.includes(v));
	$: hasProfileRecords = Object.keys(domain.records).some((v) => profileRecords.includes(v));
	$: ownerConnected = $walletAddress === domain.owner;

	const records = Object.fromEntries(
		Object.entries(domain.records).map(([key, value]) => [key, String(value)])
	);

	const ownerBrowserUrl = `${config.browserUrl}/${isTld ? 'contracts' : 'accounts'}/${
		domain.owner
	}`;

	let tabs: Array<DomainTab> = [DomainTab.details];
	if (!isTld) tabs.push(DomainTab.settings);
</script>

<Card class="domain-container">
	<CardContent>
		<div class="avatar">
			<div class="svg">
				{@html domainAvatar}
			</div>
		</div>
		<h5 class="domain">{domainName}</h5>

		{#if ownerConnected}
			<TabBar {tabs} let:tab bind:active={activeTab}>
				<Tab {tab}>
					<Label>{tab}</Label>
				</Tab>
			</TabBar>
		{/if}

		{#if activeTab === DomainTab.details}
			<Paper variant="unelevated">
				<Content>
					<div class="container">
						{#if hasProfileRecords}
							<div class="section">
								<h5>Profile</h5>
								<div class="chips">
									{#each profileRecords as klass}
										{#if domain.records[klass]}
											{#if klass === 'Uri' && isValidURL(domain.records[klass].toString())}
												<Chip
													class="mt-1 mr-1"
													label={klass}
													value={domain.records[klass]?.toString() ?? ''}
													href={domain.records[klass].toString()}
												/>
											{:else}
												<Chip
													class="mt-1 mr-1"
													label={klass}
													value={domain.records[klass]?.toString() ?? ''}
												/>
											{/if}
										{/if}
									{/each}
								</div>
							</div>
						{/if}
						<div class={`section ${hasProfileRecords ? 'mt-3' : ''}`}>
							<h5>Whois</h5>
							<div class="chips">
								{#if !isTld}
									{#if domain.parentId}
										<Chip
											class="mt-1 mr-1"
											label="Parent"
											value={domain.parentId}
											href={`/domain/${domain.parentId}`}
										/>
									{:else}
										<Chip class="mt-1 mr-1" label="Parent" value={domain.tld} href="/tld" />
									{/if}
									<Chip
										class="mt-1 mr-1"
										label="Expires"
										value={domain.expiresAt ? formatDate(domain.expiresAt) : 'Never'}
									/>
								{/if}
								<Chip
									class="mt-1 mr-1"
									label="Owner"
									value={domain.owner}
									href={ownerBrowserUrl}
									ellipsis
								/>
							</div>
						</div>
						{#if hasSocialRecords}
							<div class="section mt-3">
								<h5>Social</h5>
								<div class="chips">
									{#each socialRecords as klass}
										{#if domain.records[klass]}
											<Chip
												class="mt-1 mr-1"
												label={klass}
												value={domain.records[klass]?.toString() ?? ''}
											/>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</Content>
			</Paper>
		{:else if activeTab === DomainTab.settings}
			<Paper variant="unelevated">
				<Content>
					<Records
						ownerAddress={domain.owner}
						{records}
						repository={domain.getRecordRepository($metaNamesSdk)}
					/>
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

			.chips {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				justify-content: start;
			}

			h5 {
				margin: 0;
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
