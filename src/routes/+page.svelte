<script lang="ts">
	import Card, { PrimaryAction } from '@smui/card';
	import { formatDistanceToNow } from 'date-fns';

	import type { PageData } from './$types';
	import DomainSearch from './DomainSearch.svelte';
	import { goto } from '$app/navigation';
	import Carosel from '../components/Carosel.svelte';

	export let data: PageData;

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
				<Carosel autoplay={2000} controls={false} perPage={2}>
					{#each data.stats.recentDomains as domain}
						<Card class="domain">
							<PrimaryAction on:click={() => goto(`/domain/${domain.name}`)} padded>
								<span class="domain-name">{domain.name}</span>
								<span class="domain-date">{formatCreatedAt(domain.createdAt)}</span>
							</PrimaryAction>
						</Card>
					{/each}
				</Carosel>
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
		margin-top: 1rem;

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

			@media screen and (max-width: 600px) {
				flex-direction: column;

				:global(.domain) {
					margin-right: 0;
					margin-bottom: 1rem;
				}
			}
		}
	}
</style>
