<script lang="ts">
	import Card, { PrimaryAction } from '@smui/card';
	import { formatDistanceToNow } from 'date-fns';

	import type { PageData } from './$types';
	import DomainSearch from './DomainSearch.svelte';
	import { goto } from '$app/navigation';
	import Carosel from '../components/Carosel.svelte';
	import { browser } from '$app/environment';

	export let data: PageData;

	let loaded: boolean = false;
	let innerWidth: number = browser ? window.innerWidth : 0;

	$: isDesktop = innerWidth > 768;
	$: innerWidth > 0 && (loaded = true);

	if (browser) {
		window.addEventListener('resize', () => {
			innerWidth = window.innerWidth;
		});
	}

	function formatCreatedAt(date: Date) {
		return formatDistanceToNow(date, { addSuffix: true });
	}
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="content">
	<h3>Find your Meta Name</h3>
	<p class="subtitle">Powered by Partisia</p>
	<div class="search-container">
		<DomainSearch />
		<div class="recent-domains">
			<h5>Recently registered domains</h5>
			<div class="content">
				{#if isDesktop}
					<Carosel autoplay={2000} controls={false} perPage={3}>
						{#each data.stats.recentDomains as domain}
							<Card class="domain">
								<PrimaryAction on:click={() => goto(`/domain/${domain.name}`)} padded>
									<span class="domain-name">{domain.name}</span>
									<span class="domain-date">{formatCreatedAt(domain.createdAt)}</span>
								</PrimaryAction>
							</Card>
						{/each}
					</Carosel>
				{:else if isDesktop === false}
					<div class="mobile" class:loaded>
						{#each data.stats.recentDomains as domain}
							<Card class="domain">
								<PrimaryAction on:click={() => goto(`/domain/${domain.name}`)} padded>
									<span class="domain-name">{domain.name}</span>
									<span class="domain-date">{formatCreatedAt(domain.createdAt)}</span>
								</PrimaryAction>
							</Card>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.subtitle {
		text-transform: uppercase;
		font-size: x-small;
		color: var(--mdc-theme-text-hint-on-background);
	}
	h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
	}

	.search-container {
		display: inline-block;
	}

	.recent-domains {
		margin-top: 4rem;

		h5 {
			margin-bottom: 1rem;
		}

		.content {
			max-width: 70vw;

			:global(.domain) {
				margin-right: 1rem;
				width: auto;
				overflow-x: visible;
			}

			:global(.domain-name) {
				font-weight: bold;
				margin-bottom: 0.5rem;
				overflow-x: visible;
			}

			:global(.domain-date) {
				font-size: 0.8rem;
				color: var(--mdc-theme-text-hint-on-background);
			}

			.mobile {
				opacity: 0;
				max-height: 10vh;
				transition: opacity 0.4s ease-in-out;

				&.loaded {
					opacity: 1;
					max-height: max-content;
				}

				:global(.domain) {
					margin-right: 0;
					margin-bottom: 1rem;
				}
			}
		}
	}
</style>
