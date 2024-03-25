import { config } from '../config';
import { PROPOSALS_WALLET_PRIVATE_KEY } from '$env/static/private';

export const proposalsWalletPrivateKey = `${PROPOSALS_WALLET_PRIVATE_KEY}`;

const tldMigrationProposal = {
	mainnet: '02bdce8a432de1de5e8d0d413517c2e10ebb0d3e80',
	testnet: '021e68773e9bd5fc28381802c4b24899499f039ea9'
};
export const tldMigrationProposalContractAddress =
	config.environment === 'prod' ? tldMigrationProposal.mainnet : tldMigrationProposal.testnet;
