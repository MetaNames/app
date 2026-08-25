import { handleError, jsonError, metaNamesSdk } from '$lib/server';
import type { BYOCSymbol } from '@metanames/sdk';
import { json } from '@sveltejs/kit';

export async function GET({ params: { name, coin } }) {
	return handleError(async () => {
		const validCoins = metaNamesSdk.config.byoc.map((byoc) => byoc.symbol.toString());
		if (!validCoins.includes(coin)) return jsonError(400, 'Invalid coin');

		const normalizedDomain = metaNamesSdk.domainRepository.domainValidator.normalize(name);
		const domainFees = await metaNamesSdk.domainRepository.calculateMintFees(
			normalizedDomain,
			coin as BYOCSymbol
		);
		const fees = { ...domainFees, fees: domainFees.fees.toString() };

		return json(fees);
	});
}
