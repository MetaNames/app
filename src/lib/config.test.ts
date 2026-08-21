import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('@metanames/sdk', () => ({
	Enviroment: { testnet: 'testnet', mainnet: 'mainnet' }
}));

const loadConfig = async (viteEnv?: string) => {
	if (viteEnv === undefined) vi.stubEnv('VITE_ENV', undefined as unknown as string);
	else vi.stubEnv('VITE_ENV', viteEnv);

	vi.resetModules();
	return (await import('./config')).config;
};

describe('config', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	describe('environment', () => {
		it('defaults to test when VITE_ENV is unset', async () => {
			const config = await loadConfig();
			expect(config.environment).toBe('test');
		});

		it.each(['', 'undefined'])(
			'falls back to test rather than mainnet when VITE_ENV is %o',
			async (viteEnv) => {
				// Regression: `import.meta.env.VITE_ENV ?? 'test'` only caught `undefined`, so a
				// blank env var silently pointed browser URLs and the SDK at mainnet.
				const config = await loadConfig(viteEnv);

				expect(config.environment).toBe('test');
				expect(config.sdkEnvironment).toBe('testnet');
				expect(config.browserUrl).toBe('https://browser.testnet.partisiablockchain.com');
			}
		);

		it('selects prod for any other explicit value', async () => {
			const config = await loadConfig('prod');

			expect(config.environment).toBe('prod');
			expect(config.sdkEnvironment).toBe('mainnet');
			expect(config.browserUrl).toBe('https://browser.partisiablockchain.com');
		});

		it('keeps treating unrecognised values as prod', async () => {
			expect((await loadConfig('production')).environment).toBe('prod');
		});
	});

	describe('sentryTracesSampleRate', () => {
		it('samples every trace outside prod', async () => {
			expect((await loadConfig('test')).sentryTracesSampleRate).toBe(1.0);
		});

		it('samples a tenth of prod traces', async () => {
			expect((await loadConfig('prod')).sentryTracesSampleRate).toBe(0.1);
		});
	});

	describe('contractDisabled', () => {
		it('is false unless VITE_CONTRACT_DISABLED is exactly "true"', async () => {
			vi.stubEnv('VITE_CONTRACT_DISABLED', '');
			vi.resetModules();
			expect((await import('./config')).config.contractDisabled).toBe(false);

			vi.stubEnv('VITE_CONTRACT_DISABLED', 'true');
			vi.resetModules();
			expect((await import('./config')).config.contractDisabled).toBe(true);
		});
	});
});
