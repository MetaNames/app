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
};

const environment = import.meta.env.VITE_ENV ?? 'test';
const browserUrl = `https://browser${environment === 'test' ? '.testnet' : ''}.partisiablockchain.com`;
const chainId = `Partisia Blockchain${environment === 'test' ? ' Testnet' : ''}`;

const sdkEnvironment = environment === 'test' ? Enviroment.testnet : Enviroment.mainnet;
const landingUrl = optionalEnv(import.meta.env.VITE_LANDING_URL, 'https://metanames.app');
const websiteUrl = optionalEnv(import.meta.env.VITE_WEBSITE_URL, 'https://app.metanames.app/');
const contractDisabled = `${import.meta.env.VITE_CONTRACT_DISABLED}` == 'true';

export const config: Config = {
	browserUrl,
	chainId,
	contractDisabled,
	environment,
	dAppName: 'Meta Names',
	sdkEnvironment,
	permissions: ['sign'] as PermissionType[],
	landingUrl,
	websiteUrl
};
