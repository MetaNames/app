<script lang="ts">
	import { goto } from '$app/navigation';
	import { track } from '@vercel/analytics';
	import {
		alertTransactionAndFetchResult,
		onLoadErrorRedirect,
		recipientAddressErrors
	} from '$lib';
	import { alertMessage, walletAddress } from '$lib/stores/main';
	import { metaNamesSdk } from '$lib/stores/sdk';
	import type { PageData } from './$types';

	import Card, { Content } from '@smui/card';
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import ConnectionRequired from 'src/components/ConnectionRequired.svelte';
	import GoBackButton from 'src/components/GoBackButton.svelte';
	import LoadingButton from 'src/components/LoadingButton.svelte';

	export let data: PageData;

	let address = '';

	$: domainName = data.analyzed?.name;
	$: errors = recipientAddressErrors(address);
	// An empty recipient is never submittable, but don't paint a pristine field red:
	// `invalid` only drives the visual/helper state, `errors` gates the button.
	$: invalid = address !== '' && errors.length > 0;

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

	onLoadErrorRedirect(data);
</script>

<svelte:head>
	<title>Transfer {domainName} | Meta Names</title>
</svelte:head>

<div class="content checkout">
	{#if data.analyzed}
		<h1 class="mt-0 type-headline2">Transfer domain</h1>
		<Card class="w-100 flex-content">
			<Content>
				<h2 class="type-headline4">{domainName}</h2>
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
						input$aria-invalid={invalid}
						label="Recipient address"
					>
						<svelte:fragment slot="helper">
							{#if invalid}
								<HelperText slot="helper">{errors.join(', ')}</HelperText>
							{/if}
						</svelte:fragment>
					</Textfield>
				</div>
				<ConnectionRequired>
					<LoadingButton disabled={errors.length > 0} onClick={transfer} variant="raised"
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
	h2 {
		margin: 0;
		margin-top: 1rem;
	}
</style>
