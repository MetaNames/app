<script lang="ts">
	import { goto } from '$app/navigation';
	import { alertMessage } from '$lib/stores/main';
	import { fetchApiJson } from '$lib/api';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import type { DomainCheckResponse, DomainPaymentParams } from '$lib/types';
	import { writable } from 'svelte/store';

	import type { IDomainAnalyzed } from '@metanames/sdk';
	import CircularProgress from '@smui/circular-progress';
	import SubdomainRegistration from 'src/routes/register/[name]/SubdomainRegistration.svelte';
	import { onMount } from 'svelte';
	import DomainPayment from 'src/components/DomainPayment.svelte';
	import { runTransaction } from '$lib/transaction';
	import { track } from '@vercel/analytics';
	import { page } from '$app/stores';
	import { trackLatest } from '$lib/race';

	const isDomainPresent = writable<boolean | undefined>();
	const isParentPresent = writable<boolean>();
	const analyzed = writable<IDomainAnalyzed>();

	let mounted = false;
	const latest = trackLatest();

	// SvelteKit reuses this component when only `[name]` changes, and the parent-not-found branch
	// below redirects to `/register/<parent>` — the same route. A name captured once would leave
	// the old domain rendered under the new URL.
	$: nameParam = $page.params.name ?? '';
	// Gated on `mounted` so the first run happens after mount, never mid-hydration.
	$: if (mounted) analyzeAndCheck(nameParam);

	$: domainName = $analyzed?.name;
	$: parentDomainName = $analyzed?.parentId;
	$: pageName = domainName + ' | ';
	$: tld = $analyzed?.tld;

	async function payment(params: DomainPaymentParams) {
		const transactionIntent = await $metaNamesSdk.domainRepository.register({
			domain: params.domainName,
			to: params.address,
			subscriptionYears: params.years,
			byocSymbol: params.byocSymbol
		});

		await runTransaction(transactionIntent, 'Failed to register domain.');
		alertMessage.set({
			message: 'Domain registered successfully!',
			action: { label: 'Go to profile', callback: () => goto('/profile') }
		});

		track('domain_registered', {
			domain: domainName,
			years: params.years,
			byoc: params.byocSymbol
		});

		return goto(`/domain/${domainName}`);
	}

	onMount(() => {
		mounted = true;
	});

	async function analyzeAndCheck(name: string) {
		const currentId = latest.next();
		isDomainPresent.set(undefined);

		try {
			analyzed.set($metaNamesSdk.domainRepository.analyze(name));
		} catch (error) {
			let errorMessage = 'Failed to analyze domain.';
			if (error instanceof Error) errorMessage = error.message;
			alertMessage.set(errorMessage);

			return goto('/', { replaceState: true });
		}

		const check = await fetchApiJson<DomainCheckResponse>(`/api/domains/${$analyzed.name}/check`);
		// A redirect started a newer pass; that pass owns the stores now.
		if (!latest.check(currentId)) return;

		if ('error' in check) {
			alertMessage.set(check.error);

			return goto('/', { replaceState: true });
		}

		isDomainPresent.set(check.domainPresent);
		if (check.domainPresent) {
			alertMessage.set('Domain already registered.');

			return goto(`/domain/${$analyzed.name}`, { replaceState: true });
		}

		isParentPresent.set(check.parentPresent);
		if ($analyzed.parentId && !check.parentPresent)
			return goto(`/register/${$analyzed.parentId}`, { replaceState: true });
	}
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content checkout" data-testid="checkout-content">
	{#if $isDomainPresent === undefined}
		<!-- The same role="status" wrapper /domain gives its spinner. The wrapper carries the
		     accessible name: the region is what gets announced, so naming the child instead would
		     leave the wait silent — and the child mounts and unmounts anyway. -->
		<div role="status" aria-label="Loading the registration form">
			<CircularProgress style="height: 32px; width: 32px;" indeterminate />
		</div>
	{:else}
		<h1 class="mt-0 type-headline2">Register</h1>
		{#if $isParentPresent && parentDomainName}
			<SubdomainRegistration {domainName} {parentDomainName} />
		{:else}
			<DomainPayment {domainName} {tld} paymentLabel="Register domain" {payment} />
		{/if}
	{/if}
</div>
