import { analyzeDomain } from '$lib/loaders';

export function load({ params: { name } }) {
	return analyzeDomain(name);
}
