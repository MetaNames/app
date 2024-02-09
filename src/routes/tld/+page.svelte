<script lang="ts">
	import Domain from 'src/components/Domain.svelte';

	import { metaNamesSdk } from "$lib/stores/sdk";
	import { Domain as DomainModel, type IDomain } from "@metanames/sdk";

  const contractAddress = $metaNamesSdk.config.contractAddress;

  const domainData: IDomain = {
    name: "meta",
    createdAt: new Date(),
    tld: '',
    owner: contractAddress,
    tokenId: NaN,
    records: new Map(),
  }

  const domain = new DomainModel(domainData, $metaNamesSdk.contract);
</script>

<svelte:head>
	<title>Meta | Meta Names</title>
</svelte:head>

<div class="content">
  <Domain {domain} isTld={true} />
</div>
