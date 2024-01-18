import { Enviroment } from '@metanames/sdk';
import type { PermissionTypes } from 'partisia-sdk/dist/sdk-listeners';

type Config = {
	browserUrl: string;
	chainId: string;
	dAppName: string;
	environment: 'test' | 'prod';
	sdkEnvironment: Enviroment;
	permissions: PermissionTypes[];
	websiteUrl: string;
};

const environment = import.meta.env.VITE_ENV ?? 'test';
const browserUrl = `https://browser${environment === 'test' ? '.testnet' : ''}.partisiablockchain.com`;
const chainId = `Partisia Blockchain${environment === 'test' ? ' Testnet' : ''}`;

const sdkEnvironment = environment === 'test' ? Enviroment.testnet : Enviroment.mainnet;
const websiteUrl = `${import.meta.env.VITE_WEBSITE_URL}`;

export const config: Config = {
	browserUrl,
	chainId,
	environment,
	dAppName: 'Meta Names',
	sdkEnvironment,
	permissions: ['sign'] as PermissionTypes[],
	websiteUrl,
};
