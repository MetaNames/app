<script lang="ts">
	import Card, { PrimaryAction } from '@smui/card';
	import { formatDistanceToNow } from 'date-fns';

	import DomainSearch from 'src/routes/DomainSearch.svelte';
	import { goto } from '$app/navigation';
	import Carousel from 'svelte-carousel';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { recentDomains, type DomainProjection } from 'src/lib/stores/main';

	let innerWidth: number = browser ? window.innerWidth : 0;

	$: isDesktop = innerWidth > 768;
	$: loaded = $recentDomains.length > 1;

	if (browser) {
		window.addEventListener('resize', () => {
			innerWidth = window.innerWidth;
		});
	}

	function formatCreatedAt(date: string) {
		const parsed = new Date(date);
		return formatDistanceToNow(parsed, { addSuffix: true });
	}

	onMount(async () => {
		const domains: DomainProjection[] = await fetch('/api/domains/recent').then(
			async (res) => await res.json()
		);
		recentDomains.set(domains);
	});
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="content">
	<h3>Find your Meta Name</h3>
	<p class="subtitle">Powered by Partisia</p>
	<div class="search-container">
		<DomainSearch />
	</div>
	<div class="recent-domains" class:loaded>
		<h5>Recently registered domains</h5>
		<div class="content">
			<Carousel
				autoplayDuration={0}
				particlesToShow={isDesktop ? 3 : 2}
				duration={8000}
				autoplay
				timingFunction="linear"
				dots={false}
				arrows={false}
			>
				{#each $recentDomains as domain (domain.name)}
					<Card class="domain">
						<PrimaryAction on:click={() => goto(`/domain/${domain.name}`)} padded>
							<span class="domain-name">{domain.name}</span>
							<span class="domain-date">{formatCreatedAt(domain.createdAt)}</span>
						</PrimaryAction>
					</Card>
				{/each}
			</Carousel>
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
		opacity: 0;
		transition: opacity 0.5s ease-in-out;

		&.loaded {
			opacity: 1;
		}

		h5 {
			margin-bottom: 1rem;
		}

		.content {
			max-width: 80vw;

			@media screen and (max-width: 768px) {
				max-width: 90vw;
			}

			:global(.domain) {
				margin-right: 1rem;
				user-select: none;
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
		}
	}
</style>
