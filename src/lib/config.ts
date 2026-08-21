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
const browserUrl = `https://browser${environment === 'test' ? '.testnet' : ''}.partisiablockchain.com`;
const chainId = `Partisia Blockchain${environment === 'test' ? ' Testnet' : ''}`;

const sdkEnvironment = environment === 'test' ? Enviroment.testnet : Enviroment.mainnet;
const landingUrl = optionalEnv(import.meta.env.VITE_LANDING_URL, 'https://metanames.app');
const websiteUrl = optionalEnv(import.meta.env.VITE_WEBSITE_URL, 'https://app.metanames.app/');
const contractDisabled = optionalEnv(import.meta.env.VITE_CONTRACT_DISABLED, 'false') === 'true';
const sentryDsn = optionalEnv(
	import.meta.env.VITE_SENTRY_DSN,
	'https://a3030e6b43e234337425afcedb4bc727@o4506739278544896.ingest.us.sentry.io/4506739280183296'
);
const sentryTracesSampleRate = environment === 'prod' ? 0.1 : 1.0;

export const config: Config = {
	browserUrl,
	chainId,
	contractDisabled,
	environment,
	dAppName: 'Meta Names',
	sdkEnvironment,
	permissions: ['sign'] as PermissionType[],
	landingUrl,
	websiteUrl,
	sentryDsn,
	sentryTracesSampleRate
};
