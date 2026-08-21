import { describe, it, expect, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';

const { byocMock, environmentMock } = vi.hoisted(() => ({
	byocMock: { value: [] as { symbol: string }[] },
	environmentMock: { value: 'test' as 'test' | 'prod' }
}));

vi.mock('$lib', () => ({
	get config() {
		return { environment: environmentMock.value };
	},
	metaNamesSdkFactory: () => ({ config: { byoc: byocMock.value } })
}));

const loadSelectedCoin = async (environment: 'test' | 'prod', byoc: { symbol: string }[]) => {
	environmentMock.value = environment;
	byocMock.value = byoc;

	vi.resetModules();
	return get((await import('./stores/sdk')).selectedCoin);
};

describe('stores/sdk selectedCoin', () => {
	afterEach(() => {
		vi.resetModules();
	});

	it('starts on the first coin on testnet', async () => {
		const coin = await loadSelectedCoin('test', [{ symbol: 'TEST_COIN' }, { symbol: 'ETH' }]);
		expect(coin).toBe('TEST_COIN');
	});

	it('prefers ETH on mainnet', async () => {
		const coin = await loadSelectedCoin('prod', [{ symbol: 'USDC' }, { symbol: 'ETH' }]);
		expect(coin).toBe('ETH');
	});

	it('falls back to the first coin when ETH is not offered', async () => {
		// Regression: this used to be `byocs.find(...) as BYOC`, so a config without ETH threw
		// on `.symbol` at module load — and every page imports this store.
		const coin = await loadSelectedCoin('prod', [{ symbol: 'USDC' }, { symbol: 'MPC' }]);
		expect(coin).toBe('USDC');
	});
});
