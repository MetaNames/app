import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run dev -- --port 4173',
		port: 4173,
		// Always boot a fresh dev server: a stale one left over from an earlier run
		// serves the previous bundle, which silently masks bundle-size changes.
		reuseExistingServer: false
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	retries: 3,
	workers: 2,
	use: {
		screenshot: 'only-on-failure',
		trace: 'on-first-retry'
	}
};

export default config;
