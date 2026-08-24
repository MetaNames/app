<script lang="ts">
	import type { Domain } from '@metanames/sdk';
	import { toSvg } from 'jdenticon';

	import Card, { Content as CardContent } from '@smui/card';
	import Paper, { Content } from '@smui/paper';
	import Tab, { Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';

	import {
		explorerAddressUrl,
		formatDate,
		isValidURL,
		profileRecords,
		removeHTTPIfPresent,
		shortLinkUrl,
		socialRecords
	} from '$lib';
	import { DomainTab } from '$lib/types';
	import Chip from 'src/components/Chip.svelte';
	import Records from 'src/components/Records.svelte';
	import { walletAddress } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import Button from '@smui/button';

	export let domain: Domain;
	export let isTld: boolean = false;
	export let activeTab: DomainTab = DomainTab.details;

	$: domainAvatar = domain.name && toSvg(domain.name, 200);
	$: domainName = isTld ? domain.nameWithoutTLD : domain.name;
	$: hasSocialRecords = Object.keys(domain.records).some((v) => socialRecords.includes(v));
	$: hasProfileRecords = Object.keys(domain.records).some((v) => profileRecords.includes(v));
	$: ownerConnected = $walletAddress === domain.owner;
	// Derived reactively, not once: the page reuses this component across domains.
	$: records = Object.fromEntries(
		Object.entries(domain.records).map(([key, value]) => [key, String(value)])
	);
	$: ownerBrowserUrl = explorerAddressUrl(domain.owner);

	let tabs: Array<DomainTab> = [DomainTab.details];
	if (!isTld) tabs.push(DomainTab.settings);
</script>

<Card class="domain-container">
	<CardContent>
		<div class="avatar">
			<div class="svg">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- jdenticon's toSvg renders a hash of the name, never the name itself -->
				{@html domainAvatar}
			</div>
		</div>
		<h1 class="domain type-headline5">{domainName}</h1>

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
						<div class="section">
							<h2 class="mt-0 type-headline5">Profile</h2>
							<div class="chips">
								<Chip
									class="mt-1 mr-1"
									type="text"
									label="link"
									value={removeHTTPIfPresent(shortLinkUrl(domain.nameWithoutTLD))}
									href={shortLinkUrl(domain.nameWithoutTLD)}
									ellipsis
								/>
								{#if hasProfileRecords}
									{#each profileRecords as klass}
										{#if domain.records[klass]}
											{#if klass === 'Uri' && isValidURL(domain.records[klass].toString())}
												<Chip
													class="mt-1 mr-1"
													label={klass}
													value={removeHTTPIfPresent(domain.records[klass]?.toString() ?? '')}
													href={domain.records[klass].toString()}
												/>
											{:else if klass === 'Price'}
												<Chip
													class="mt-1 mr-1"
													label={klass}
													value={domain.records[klass]?.toString() + '$'}
												/>
											{:else}
												<Chip
													class="mt-1 mr-1"
													label={klass}
													value={domain.records[klass]?.toString()}
												/>
											{/if}
										{/if}
									{/each}
								{/if}
							</div>
						</div>
						<div class={`section ${hasProfileRecords ? 'mt-3' : ''}`}>
							<h2 class="type-headline5">Whois</h2>
							<div class="chips">
								{#if !isTld}
									{#if domain.parentId}
										<Chip
											class="mt-1 mr-1"
											label="Parent"
											value={domain.parentId}
											href={`/domain/${domain.parentId}`}
										/>
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
								<h2 class="type-headline5">Social</h2>
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
					<br />
					<h2 class="mt-0 mb-1 type-headline5">Actions</h2>
					<Button
						class="mt-1 mr-1 mobile--mr-0"
						href={`/domain/${domain.name}/renew`}
						variant="raised">Renew</Button
					>
					<Button class="mt-1" href={`/domain/${domain.name}/transfer`} variant="raised"
						>Transfer</Button
					>
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

			// align-items: start sizes each section to fit-content, and fit-content is
			// floored at min-content — so a nowrap chip wider than the card dragged the
			// section (and the document) past the viewport: /domain and /tld both go to 373px
			// at 320px without this. Stretch them to the card instead and let the chips
			// shrink inside.
			.section {
				align-self: stretch;
			}

			.chips {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			h2 {
				margin: 0;
				margin-top: 1rem;
				text-align: start;
				font-weight: 800;
				word-wrap: break-word;
			}

			@media screen and (max-width: 768px) {
				h2 {
					text-align: center;
				}

				.chips {
					justify-content: center;
				}
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
