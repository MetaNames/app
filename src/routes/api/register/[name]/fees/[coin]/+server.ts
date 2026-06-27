import { apiError, handleError, metaNamesSdk } from '$lib/server';
import type { BYOCSymbol } from '@metanames/sdk';
import { json } from '@sveltejs/kit';

// Precomputing the valid coins at module level to avoid recalculation per request
const validCoinsSet = new Set(metaNamesSdk.config.byoc.map((byoc) => byoc.symbol.toString()));

export async function GET({ params: { name, coin } }) {
	return handleError(async () => {
		if (!validCoinsSet.has(coin)) return apiError('Invalid coin');

		const normalizedDomain = metaNamesSdk.domainRepository.domainValidator.normalize(name);
		const domainFees = await metaNamesSdk.domainRepository.calculateMintFees(
			normalizedDomain,
			coin as BYOCSymbol
		);
		const fees = { ...domainFees, fees: domainFees.fees.toString() };

		return json(fees);
	});
}
