import { Enviroment } from '@metanames/sdk';
import type { PermissionTypes } from 'partisia-sdk/dist/sdk-listeners';

type Config = {
	browserUrl: string;
	chainId: string;
	contractDisabled: boolean;
	dAppName: string;
	environment: 'test' | 'prod';
	sdkEnvironment: Enviroment;
	permissions: PermissionTypes[];
	landingUrl: string;
	tldMigrationProposalContractAddress: string;
	websiteUrl: string;
};

const environment = import.meta.env.VITE_ENV ?? 'test';
const browserUrl = `https://browser${environment === 'test' ? '.testnet' : ''}.partisiablockchain.com`;
const chainId = `Partisia Blockchain${environment === 'test' ? ' Testnet' : ''}`;

const sdkEnvironment = environment === 'test' ? Enviroment.testnet : Enviroment.mainnet;
const landingUrl = `${import.meta.env.VITE_LANDING_URL}`;
const websiteUrl = `${import.meta.env.VITE_WEBSITE_URL}`;
const contractDisabled = `${import.meta.env.VITE_CONTRACT_DISABLED}` == 'true';

const tldMigrationProposal = {
	mainnet: '02fba7fc0463c34c55a68b05550f24755629cdccd0',
	testnet: '021e68773e9bd5fc28381802c4b24899499f039ea9'
};
const tldMigrationProposalContractAddress =
	environment === 'prod' ? tldMigrationProposal.mainnet : tldMigrationProposal.testnet;

export const config: Config = {
	browserUrl,
	chainId,
	contractDisabled,
	environment,
	dAppName: 'Meta Names',
	sdkEnvironment,
	permissions: ['sign'] as PermissionTypes[],
	landingUrl,
	tldMigrationProposalContractAddress,
	websiteUrl
};
