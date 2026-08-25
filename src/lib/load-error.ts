import { goto } from '$app/navigation';
import { onMount } from 'svelte';

import { alertMessage } from './stores/main';

/**
 * Shared by the transfer and renew pages, whose identical `onMount` blocks
 * surface a load failure (`{ error }` from `analyzeDomain`) through the alert
 * store and redirect home with a replaced history entry.
 */
export function onLoadErrorRedirect(data: Record<string, unknown>): void {
	onMount(() => {
		if ('error' in data) {
			const message: string = typeof data.error === 'string' ? data.error : String(data.error);
			alertMessage.set(message);
			return goto('/', { replaceState: true });
		}
	});
}
