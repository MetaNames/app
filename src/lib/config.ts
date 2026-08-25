import { Enviroment } from '@metanames/sdk';

import { optionalEnv } from './env';

type PermissionType = 'sign' | 'private_key';

type Config = {
	browserUrl: string;
	chainId: string;
	contractDisabled: boolean;
	dAppName: string;
	environment: 'test' | 'prod';
	sdkEnvironment: Enviroment;
	permissions: PermissionType[];
	landingUrl: string;
	websiteUrl: string;
	sentryDsn: string;
	sentryTracesSampleRate: number;
};

// Anything that is not explicitly "test" selects mainnet, so a blank or literally
// "undefined" VITE_ENV must not fall through to it: `??` only guards against `undefined`,
// which left an empty VITE_ENV pointing the app at mainnet.
const environment: Config['environment'] =
	optionalEnv(import.meta.env.VITE_ENV, 'test') === 'test' ? 'test' : 'prod';

// One row per environment so every derived value is picked in a single lookup instead of
// being re-ternaried off `environment` at each use site.
const ENVIRONMENTS = {
	test: {
		browserUrl: 'https://browser.testnet.partisiablockchain.com',
		chainId: 'Partisia Blockchain Testnet',
		sdkEnvironment: Enviroment.testnet,
		sentryTracesSampleRate: 1.0
	},
	prod: {
		browserUrl: 'https://browser.partisiablockchain.com',
		chainId: 'Partisia Blockchain',
		sdkEnvironment: Enviroment.mainnet,
		sentryTracesSampleRate: 0.1
	}
} as const;

export const config: Config = {
	...ENVIRONMENTS[environment],
	contractDisabled: optionalEnv(import.meta.env.VITE_CONTRACT_DISABLED, 'false') === 'true',
	dAppName: 'Meta Names',
	environment,
	permissions: ['sign'] as PermissionType[],
	landingUrl: optionalEnv(import.meta.env.VITE_LANDING_URL, 'https://metanames.app'),
	websiteUrl: optionalEnv(import.meta.env.VITE_WEBSITE_URL, 'https://app.metanames.app/'),
	sentryDsn: optionalEnv(
		import.meta.env.VITE_SENTRY_DSN,
		'https://a3030e...c727@o4506739278544896.ingest.us.sentry.io/4506739280183296'
	)
};
