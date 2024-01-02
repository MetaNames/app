import type { PermissionTypes } from 'partisia-sdk/dist/sdk-listeners';

type Config = {
	browserUrl: string;
	chainId: string;
	dAppName: string;
	environment: 'test' | 'prod';
	permissions: PermissionTypes[];
};

const environment = import.meta.env.VITE_ENV ?? 'test';
const browserUrl = `https://browser${environment === 'test' ? '.testnet' : ''}.partisiablockchain.com`;
const chainId = `Partisia Blockchain${environment === 'test' ? ' Testnet' : ''}`;

const config: Config = {
	browserUrl,
	chainId,
	environment,
	dAppName: 'Meta Names',
	permissions: ['sign'] as PermissionTypes[]
};

export default config;
