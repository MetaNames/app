<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { metaNamesSdk } from '$lib';
	import type { Domain as DomainModel } from '@metanames/sdk';
	import Button, { Label } from '@smui/button';
	import Card, { Content } from '@smui/card';
	import IconButton from '@smui/icon-button';
	import { onMount } from 'svelte';

	let domain: DomainModel | null;

	const domainName = $page.params.name;
	let years = 1;

	$: pageName = domain ? domain.name + ' | ' : '';
	$: fees = metaNamesSdk.domainRepository.calculateMintFees(domainName);
	$: totalFeesAmount = fees.amount * years;

	function addYears(amount: number) {
		if (years + amount < 1) return;

		years += amount;
	}

	onMount(async () => {
		domain = await metaNamesSdk.domainRepository.find(domainName);

		if (domain) goto(`/domain/${domain.name}`);
	});
</script>

<svelte:head>
	<title>{pageName}Meta Names</title>
</svelte:head>

<div class="content">
	{#if !domain}
		<div class="container">
			<h2>Register</h2>
			<Card>
				<Content>
					<div class="card-content">
						<h4>{domainName}</h4>

						<div class="years">
							<IconButton class="material-icons" on:click={() => addYears(-1)}>remove</IconButton>
							<span>{years}</span>
							<IconButton class="material-icons" on:click={() => addYears(1)}>add</IconButton>
						</div>

						<div class="fees">
							<div class="row">
								<span>1 year registration</span>
								<span>{fees.amount} {fees.token}</span>
							</div>
							<div class="row">
								<span>Total</span>
								<span>{totalFeesAmount} {fees.token}</span>
							</div>
						</div>

						<div class="submit">
							<Button class="button" disabled={totalFeesAmount === 0} variant="raised">
								<Label>Register</Label>
							</Button>
						</div>
					</div></Content
				>
			</Card>
		</div>
	{:else if domain === undefined}
		<p>Loading...</p>
	{/if}
</div>

<style lang="scss">
	h2,
	h4 {
		margin-top: 0;
		text-align: center;
	}

	.content {
		max-width: 48rem;
		width: 100%;
	}

	.fees {
		display: flex;
		flex-direction: column;
		align-items: center;

		margin-top: 1rem;
		padding: 0 5rem;

		.row {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
		}
	}

	.submit {
		display: flex;
		justify-content: center;

		button {
		}
	}

	.years {
		display: flex;
		justify-content: space-evenly;
		align-items: center;

		button {
			padding: 1rem;
		}

		span {
			font-size: xx-large;
		}
	}
</style>
