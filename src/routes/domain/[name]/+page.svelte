<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Domain as DomainModel, type IDomain } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import CircularProgress from '@smui/circular-progress';
	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { writable } from 'svelte/store';
	import { alertMessage } from 'src/lib/stores/main';

	let domain = writable<DomainModel>();
	const domainName = $page.params.name;

	$: pageName = $domain ? $domain.name + ' | ' : '';

	async function loadDomain() {
		type DomainResponse = { domain?: IDomain };
		const domainResponse: DomainResponse = await fetch(`/api/domains/${domainName}`).then((res) =>
			res.json()
		);
		if (domainResponse.domain) domain.set(new DomainModel(domainResponse.domain));
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
		<br class="my-1" />
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
