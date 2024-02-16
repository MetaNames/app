<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import CircularProgress from '@smui/circular-progress';
	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { writable } from 'svelte/store';
	import { alertMessage } from 'src/lib/stores/main';
	import { metaNamesSdk } from 'src/lib/stores/sdk';

	let domain = writable<DomainModel>();
	const domainName = $page.params.name;

	$: pageName = $domain ? $domain.name + ' | ' : '';

	async function loadDomain() {
		const domainResponse = await $metaNamesSdk.domainRepository.find(domainName);
		if (domainResponse) domain.set(domainResponse);
		else {
			alertMessage.set('Domain not found. Register it now!');
			goto(`/register/${domainName}`, { replaceState: true });
		}

		return $domain;
	}

	onMount(async () => {
		const loweredDomainName = domainName.toLocaleLowerCase();
		if (loweredDomainName !== domainName)
			goto(`/domain/${loweredDomainName}`, { replaceState: true });
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content domain">
	{#await loadDomain()}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:then domain}
		<Domain {domain} />
		<br />
		<GoBackButton />
	{/await}
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
