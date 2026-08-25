import { metaNamesSdkFactory } from '$lib/sdk';
import { captureException } from '@sentry/sveltekit';
import { json } from '@sveltejs/kit';

export const jsonError = (status: number, message: string) => json({ error: message }, { status });

export const metaNamesSdk = metaNamesSdkFactory({ cache_ttl: 0 });

export const handleError = (fn: () => Promise<Response>) =>
	fn().catch((error) => {
		console.error(error);
		captureException(error);

		// Expected domain errors carry an HTTP status and a client-safe message; anything
		// else is unexpected, so neither its status nor its message may reach the wire —
		// `error.message` can quote internal URLs, query shapes or stack details.
		const httpError = error as { status?: unknown; body?: { message?: unknown } };
		if (typeof httpError?.status === 'number' && typeof httpError?.body?.message === 'string')
			return jsonError(httpError.status, httpError.body.message);

		return jsonError(500, 'Internal Server Error');
	});

export interface DomainProjection {
	name: string;
	createdAt: Date;
}

export const getRecentDomains = async (count = 12): Promise<DomainProjection[]> => {
	const recentDomains = await metaNamesSdk.domainRepository
		.getAll()
		.then((domains) =>
			domains
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.slice(0, count)
				.map((domain) => ({ name: domain.name, createdAt: domain.createdAt }))
		)
		.catch((error) => {
			console.error(error);
			return [];
		});

	return recentDomains;
};

export interface DomainStats {
	domainCount: number;
	ownerCount: number;
	recentDomains: DomainProjection[];
}

export const getStats = async (): Promise<DomainStats> => {
	// Three independent contract reads; awaiting them in sequence made the endpoint as slow
	// as their sum for no reason.
	const [domainCount, ownerCount, recentDomains] = await Promise.all([
		metaNamesSdk.domainRepository.count(),
		metaNamesSdk.domainRepository.getOwners().then((owners) => owners.length),
		getRecentDomains()
	]);

	return {
		domainCount,
		ownerCount,
		recentDomains
	};
};
