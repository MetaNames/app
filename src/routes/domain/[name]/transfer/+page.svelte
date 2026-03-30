<script lang="ts">
	import { goto } from '$app/navigation';
	import { track } from '@vercel/analytics';
	import { alertTransactionAndFetchResult, validAddress } from 'src/lib';
	import { alertMessage, walletAddress } from 'src/lib/stores/main';
	import { metaNamesSdk } from 'src/lib/stores/sdk';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Card, { Content } from '@smui/card';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';

	export let data: PageData;

	let address = '';
	let errors: string[] = [];

	$: domainName = data.analyzed?.name;
	$: invalid = errors.length > 0;
	$: if (address) {
		errors = [];
		if (!address) errors.push('Address is required');
		if (!validAddress(address)) errors.push('Address is invalid');
	}

	async function transfer() {
		if (!domainName) return;
		if (errors.length > 0) return;
		if (!$walletAddress) return;

		const transactionIntent = await $metaNamesSdk.domainRepository.transfer({
			domain: domainName,
			from: $walletAddress,
			to: address
		});
		const { hasError } = await alertTransactionAndFetchResult(transactionIntent);
		if (!hasError) {
			track('domain_transfer', { domain: domainName });
			alertMessage.set('Domain transferred successfully');
			goto(`/domain/${domainName}`);
		}
	}

	onMount(async () => {
		if ('error' in data) {
			alertMessage.set(data.error);
			return goto('/', { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Transfer {domainName} | Meta Names</title>
</svelte:head>

<div class="content checkout">
	{#if data.analyzed}
		<h2 class="mt-0">Transfer domain</h2>
		<Card class="w-100 flex-content">
			<Content>
				<h4>{domainName}</h4>
				<p>
					Please note that all transfers are irreversible.
					<br />
					<b>Verify the address is correct</b> before proceeding.
				</p>
				<div class="mt-2 mb-2">
					<Textfield
						class="w-100"
						variant="outlined"
						bind:value={address}
						bind:invalid
						label="Recipient address"
					>
						<svelte:fragment slot="helper">
							{#if errors.length > 0}
								<HelperText slot="helper">{errors.join(', ')}</HelperText>
							{/if}
						</svelte:fragment>
					</Textfield>
				</div>
				<ConnectionRequired>
					<LoadingButton disabled={invalid} onClick={transfer} variant="raised"
						>Transfer domain</LoadingButton
					>
				</ConnectionRequired>
			</Content>
		</Card>
		<br />
		<GoBackButton />
	{/if}
</div>

<style lang="scss">
	h4 {
		margin: 0;
		margin-top: 1rem;
	}
</style>
