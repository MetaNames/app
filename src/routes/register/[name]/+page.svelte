<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import { alertMessage } from '$lib/stores/main';
	import type { PageData } from './$types';

	import CircularProgress from '@smui/circular-progress';

	import DomainRegistration from 'src/routes/register/[name]/DomainRegistration.svelte';
	import SubdomainRegistration from 'src/routes/register/[name]/SubdomainRegistration.svelte';

	export let data: PageData;

	let domainPresent: boolean | null = data.domainPresent;
	let parentPresent: boolean | null = data.parentPresent;

	$: domainName = data.domainName;
	$: parentDomainName = data.parentDomainName;
	$: pageName = domainName + ' | ';
	$: tld = data.tld;

	onMount(async () => {
		if (domainPresent) return goto(`/domain/${domainName}`, { replaceState: true });

		if (parentDomainName && !parentPresent) {
			alertMessage.set('Parent domain not found, please register it first.');
			return goto(`/register/${parentDomainName}`, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content container">
	{#if domainPresent === undefined || parentPresent === undefined}
		<CircularProgress style="height: 32px; width: 32px;" indeterminate />
	{:else}
		<h2>Register</h2>
		{#if parentPresent && parentDomainName}
			<SubdomainRegistration {domainName} {parentDomainName} />
		{:else if parentDomainName && !parentPresent}
			<DomainRegistration domainName={parentDomainName} {tld} />
		{:else}
			<DomainRegistration {domainName} {tld} />
		{/if}
	{/if}
</div>

<style lang="scss">
	h2 {
		margin-top: 0;
		text-align: center;
	}

	.content {
		max-width: 48rem;
		width: 100%;
	}
</style>
