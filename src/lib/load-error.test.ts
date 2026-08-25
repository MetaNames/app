import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onLoadErrorRedirect } from './load-error';

// The helper wires the redirect through Svelte's `onMount`, which is a no-op
// outside a component — exactly the environment these tests run in. Capturing
// the callback lets us drive both branches deterministically.
const mountCallbacks: Array<() => unknown> = [];

vi.mock('svelte', () => ({
	onMount: (fn: () => unknown) => {
		mountCallbacks.push(fn);
	}
}));

vi.mock('$app/navigation', () => ({
	goto: (...args: unknown[]) => {
		mockGoto(...args);
	}
}));

const mockGoto = vi.fn();

describe('onLoadErrorRedirect', () => {
	beforeEach(() => {
		mountCallbacks.length = 0;
		mockGoto.mockClear();
	});

	it('alerts and redirects home with replaced state when the load failed', () => {
		onLoadErrorRedirect({ error: 'Invalid domain name' });

		expect(mountCallbacks).toHaveLength(1);
		mountCallbacks[0]();

		expect(mockGoto).toHaveBeenCalledWith('/', { replaceState: true });
	});

	it('does not redirect when the load succeeded', () => {
		onLoadErrorRedirect({ analyzed: { name: 'alice', tld: 'meta' } });

		expect(mountCallbacks).toHaveLength(1);
		mountCallbacks[0]();

		expect(mockGoto).not.toHaveBeenCalled();
	});
});
