import { Enviroment } from '@metanames/sdk';

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
const landingUrl = `${import.meta.env.VITE_LANDING_URL}`;
const websiteUrl = `${import.meta.env.VITE_WEBSITE_URL}`;
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
