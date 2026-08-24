import { browser } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';

import { reviveDomain, type DomainDto } from '$lib/domain-dto';
import { alertMessage } from '$lib/stores/main';

export async function load({ params: { name }, fetch }) {
	const lowered = name.toLocaleLowerCase();
	if (lowered !== name) redirect(307, `/domain/${lowered}`);

	const response = await fetch(`/api/domains/${lowered}`);
	if (!response.ok) error(503, 'Could not load the domain. Please try again.');

	const { domain } = (await response.json()) as { domain: DomainDto | null };
	// Revived before the absence check rather than after, so the `null` that `redirect` rules out is
	// the one in the returned value: the page then has a `Domain`, not a `Domain | null` it would
	// have to re-check in markup that only ever renders for a domain that exists.
	const revived = reviveDomain(domain);
	if (revived === null) {
		// Guarded on `browser`: the store is module state shared by every SSR render, so setting it
		// on the server would show one visitor's message to the next. The message only ever
		// accompanied a client-side redirect anyway.
		if (browser) alertMessage.set('Domain not found. Register it now!');

		redirect(307, `/register/${lowered}`);
	}

	return { domain: revived };
}
