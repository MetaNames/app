<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import { onMount } from 'svelte';

	import CircularProgress from '@smui/circular-progress';
	import Domain from 'src/components/Domain.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import { writable } from 'svelte/store';
	import { alertMessage, refresh } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import { loadOrReport } from '$lib/read';
	import { trackLatest } from '$lib/race';

	let domain = writable<DomainModel | undefined>();
	const latest = trackLatest();
	let mounted = false;

	// SvelteKit reuses this component when only `[name]` changes, so the name has to be read
	// reactively — a value captured once goes stale on the very redirect below.
	$: domainName = $page.params.name ?? '';
	$: pageName = $domain ? $domain.name + ' | ' : '';
	// Gated on `mounted` rather than `browser` so the first run still happens after mount, as
	// it did before, and never calls `goto` mid-hydration.
	$: if (mounted) showDomain(domainName);

	onMount(() => {
		mounted = true;

		return refresh.subscribe((val) => {
			if (!val) return;

			loadDomain(domainName);
			refresh.set(false);
		});
	});

	async function showDomain(name: string) {
		const loweredName = name.toLocaleLowerCase();
		// The redirect re-runs this with the normalised param; loading the un-normalised name
		// here would race that second pass and could resolve to "not found".
		if (loweredName !== name) return goto(`/domain/${loweredName}`, { replaceState: true });

		await loadDomain(name);
	}

	async function loadDomain(name: string) {
		const currentId = latest.next();
		domain.set(undefined);

		const domainResponse = await loadOrReport(
			$metaNamesSdk.domainRepository.find(name),
			'Could not load the domain. Please try again.'
		);
		if (!latest.check(currentId)) return;

		if (domainResponse) return domain.set(domainResponse);

		// `null` is a confirmed absence and an invitation to register; `undefined` means the read
		// failed, so send the user somewhere usable rather than leaving the spinner running.
		if (domainResponse === null) {
			alertMessage.set('Domain not found. Register it now!');

			return goto(`/register/${name}`, { replaceState: true });
		}

		return goto('/', { replaceState: true });
	}
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content domain">
	{#if !$domain}
		<div role="status">
			<CircularProgress
				style="height: 32px; width: 32px;"
				indeterminate
				aria-label="Loading domain"
			/>
		</div>
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
		// Both branches have to occupy the same box, or swapping the spinner for the card moves the
		// page around. Two things made them differ, and each cost its own layout shift:
		//
		// Height: `.content` is `flex-grow: 1`, so the loading branch is stretched to whatever is
		// left of the viewport — 603px at 390x844, 495px at 1280x720 — and the footer sits under
		// that. The loaded card, its `<br>` and the go-back button measure 695.14px, so the footer
		// is shoved down 92px / 200px when the card lands. The card is 635.14px tall at both widths,
		// so one floor covers both: 44rem is the smallest whole rem clearing 695.14px.
		min-height: 44rem;
	}

	@media screen and (max-width: 768px) {
		.domain {
			// Width: `.content` is `align-self: center`, so it is shrink-to-fit, and `width: initial`
			// here used to drop the 100% above — sizing the loading branch to its 32px spinner and
			// the loaded one to the 351px card. That 32px→351px growth was 0.1419 of this route's
			// 0.1425 CLS, and it is why the plan's height-only fix (32rem, erratum E9) could not
			// have worked. Keeping `width: 100%` pins both branches to `max-width` instead.
			max-width: 90vw;
		}
	}
</style>
