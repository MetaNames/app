import { config } from './config';

// Partisia Blockchain addresses are typed by their first hex byte: `00` identifies a
// plain account address (anything else routes as a system/contract address).
const ACCOUNT_ADDRESS_HEX_PREFIX = '00';

export const explorerTransactionUrl = (transactionId: string) =>
	`${config.browserUrl}/transactions/${transactionId}`;

export const explorerAddressUrl = (address: string) => {
	let url = `${config.browserUrl}`;
	if (address.startsWith(ACCOUNT_ADDRESS_HEX_PREFIX))
		// Account
		url += `/accounts/${address}/assets`;
	// Contract
	else url += `/contracts/${address}`;

	return url;
};

export const bridgeUrl = `${config.browserUrl}/bridge`;

export const backendBrowserUrl = `https://backend.browser${config.environment === 'test' ? '.testnet' : ''}.partisiablockchain.com/graphql/query`;

export const shortLinkUrl = (domain: string) => `https://metanam.es/${domain}`;
