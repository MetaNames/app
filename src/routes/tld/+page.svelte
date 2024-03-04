<script lang="ts">
	import Domain from 'src/components/Domain.svelte';

	import { metaNamesSdk } from '$lib/stores/sdk';
	import { Domain as DomainModel, type IDomain } from '@metanames/sdk';

	const contractAddress = $metaNamesSdk.config.contractAddress;

	const domainData: IDomain = {
		name: 'meta',
		createdAt: new Date(),
		tld: '',
		owner: contractAddress,
		tokenId: NaN,
		records: {}
	};

	const domain = new DomainModel(domainData);
</script>

<svelte:head>
	<title>Meta | Meta Names</title>
</svelte:head>

<div class="content domain">
	<Domain {domain} isTld={true} />
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
