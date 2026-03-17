<script lang="ts">
	import Domain from '$lib/components/Domain.svelte';
	import { reveal } from '$lib/actions/reveal';

	import { metaNamesSdk } from '$lib/stores/sdk';
	import { Domain as DomainModel, type IDomain } from '@metanames/sdk';

	const metaNamesConfig = $metaNamesSdk.config;
	const contractAddress = metaNamesConfig.contractAddress;

	const domainData: IDomain = {
		name: metaNamesConfig.tld,
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
	<div use:reveal={{ delay: 0, threshold: 0.1 }}>
		<Domain {domain} isTld={true} />
	</div>
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
