<script lang="ts">
	import Card, { PrimaryAction } from '@smui/card';
	import DomainSearch from 'src/routes/DomainSearch.svelte';

	import { goto } from '$app/navigation';
	import Marqueeck from '@arisbh/marqueeck';
	import { fade } from 'svelte/transition';
	import { formatDateToRelativeDate } from 'src/lib';
	import { fetchApiJson } from 'src/lib/api';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	type DomainProjection = { name: string; createdAt: string };
	const recentDomains = writable<DomainProjection[]>();

	onMount(async () => {
		const response = await fetchApiJson<DomainProjection[]>('/api/domains/recent');

		if ('error' in response) {
			console.error(response.error);
		} else recentDomains.set(response);
	});
</script>

<svelte:head>
	<title>App | Meta Names</title>
</svelte:head>

<div class="container">
	<div class="header">
		<h3>Find your Meta Name</h3>
		<p class="subtitle">Powered by Partisia</p>
	</div>
	<DomainSearch />
	{#if $recentDomains?.length > 0}
		<div class="recent-domains" in:fade={{ duration: 500 }}>
			<h5>Recently registered domains</h5>
			<div class="content">
				<Marqueeck>
					{#each $recentDomains as domain (domain.name)}
						<Card class="domain">
							<PrimaryAction on:click={() => goto(`/domain/${domain.name}`)} padded>
								<span class="domain-name">{domain.name}</span>
								<span class="domain-date">{formatDateToRelativeDate(domain.createdAt)}</span>
							</PrimaryAction>
						</Card>
					{/each}
				</Marqueeck>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		flex-grow: 1;
	}

	.header {
		display: flex;
		flex-direction: column;
		text-align: center;
		margin-top: 10rem;
	}
	.subtitle {
		text-transform: uppercase;
		font-size: x-small;
		color: var(--mdc-theme-text-hint-on-background);
	}
	h3 {
		margin-top: auto;
		margin-bottom: 0.5rem;
	}

	.recent-domains {
		margin-top: 4rem;
		margin-bottom: 2rem;

		@media screen and (max-width: 768px) {
			margin-top: 1rem;
		}

		h5 {
			margin-bottom: 2rem;
		}

		.content {
			max-width: 80vw;
			height: 66pt;
			overflow-x: hidden;

			@media screen and (max-width: 768px) {
				max-width: 90vw;
			}

			:global(.domain) {
				margin-right: 1rem;
				user-select: none;
			}

			.domain-name {
				font-weight: bold;
				margin-bottom: 0.5rem;
				overflow-x: visible;
			}

			.domain-date {
				font-size: 0.8rem;
				color: var(--mdc-theme-text-hint-on-background);
			}
		}
	}
</style>
