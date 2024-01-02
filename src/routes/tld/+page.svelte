<script lang="ts">
	import Domain from '../../components/Domain.svelte';

	import { metaNamesSdk } from "$lib/stores";
	import { Domain as DomainModel, type IDomain } from "@metanames/sdk";

  const contractAddress = $metaNamesSdk.config.contractAddress;

  const domainData: IDomain = {
    name: "meta",
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

<div class="content container">
  <Domain {domain} isTld={true} />
</div>
