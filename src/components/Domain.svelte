<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
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
	import { DomainTab } from 'src/lib/types';
	import Chip from 'src/components/Chip.svelte';
	import Records from 'src/components/Records.svelte';
	import { walletAddress } from '$lib/stores/main';
	import { metaNamesSdk } from 'src/lib/stores/sdk';
	import Button from '@smui/button';

	interface Props {
		domain: Domain;
		isTld?: boolean;
		activeTab?: DomainTab;
	}

	console.log('[Domain] MOUNTING', { domainName: domain?.name });

	let { domain, isTld = false, activeTab = $bindable(DomainTab.details) }: Props = $props();

	onDestroy(() => {
		console.log('[Domain] ON_DESTROY - starting unmount');
	});

	let domainAvatar = $derived(domain.name && toSvg(domain.name, 200));
	let domainName = $derived(isTld ? domain.nameWithoutTLD : domain.name);
	let hasSocialRecords = $derived(
		Object.keys(domain.records).some((v) => socialRecords.includes(v))
	);
	let hasProfileRecords = $derived(
		Object.keys(domain.records).some((v) => profileRecords.includes(v))
	);
	let ownerConnected = $derived($walletAddress === domain.owner);

	let records = $derived(
		Object.fromEntries(Object.entries(domain.records).map(([key, value]) => [key, String(value)]))
	);
	let ownerBrowserUrl = $derived(explorerAddressUrl(domain.owner));
	let tabs = $derived<Array<DomainTab>>(
		isTld ? [DomainTab.details] : [DomainTab.details, DomainTab.settings]
	);
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
			<TabBar {tabs} bind:active={activeTab}>
				{#snippet tab(tabItem)}
					<Tab tab={tabItem}>
						<Label>{tabItem}</Label>
					</Tab>
				{/snippet}
			</TabBar>
		{/if}

		{#if activeTab === DomainTab.details}
			<Paper variant="unelevated">
				<Content>
					<div class="container">
						<div class="section">
							<h5 class="mt-0">Profile</h5>
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
					<br />
					<h5 class="mt-0 mb-1">Actions</h5>
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

			.chips {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			h5 {
				margin: 0;
				margin-top: 1rem;
				text-align: start;
				font-weight: 800;
				word-wrap: break-word;
			}

			@media screen and (max-width: 768px) {
				h5 {
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
