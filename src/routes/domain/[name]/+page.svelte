<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import CircularProgress from '@smui/circular-progress';
	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { writable } from 'svelte/store';
	import { alertMessage, refresh } from 'src/lib/stores/main';
	import { metaNamesSdk } from 'src/lib/stores/sdk';

	let domain = writable<DomainModel | undefined>();
	const domainName = $page.params.name;

	$: pageName = $domain ? $domain.name + ' | ' : '';

	refresh.subscribe((val) => {
		if (val) {
			domain.set(undefined);
			loadDomain();
			refresh.set(false);
		}
	});

	async function loadDomain() {
		const domainResponse = await $metaNamesSdk.domainRepository.find(domainName);
		if (domainResponse) domain.set(domainResponse);
		else {
			alertMessage.set('Domain not found. Register it now!');
			goto(`/register/${domainName}`, { replaceState: true });
		}
	}

	onMount(async () => {
		const loweredDomainName = domainName.toLocaleLowerCase();
		if (loweredDomainName !== domainName)
			goto(`/domain/${loweredDomainName}`, { replaceState: true });

		await loadDomain();
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content domain">
	{#if !$domain}
		<CircularProgress
			style="height: 32px; width: 32px;"
			indeterminate
			aria-label="Loading domain details"
		/>
	{:else if $domain}
		<Domain domain={$domain} />
		<br />
		<GoBackButton />
	{/if}
</div>

<style lang="scss">
	.domain {
		width: 100%;
		max-width: 48rem;
		margin: 2rem 1rem;
	}

	@media screen and (max-width: 768px) {
		.domain {
			width: initial;
			max-width: 90vw;
		}
	}
</style>
