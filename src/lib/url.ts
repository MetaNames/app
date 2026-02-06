import { config } from './config';

export const explorerTransactionUrl = (transactionId: string) =>
	`${config.browserUrl}/transactions/${transactionId}`;

export const explorerAddressUrl = (address: string) => {
	let url = `${config.browserUrl}`;
	if (address.startsWith('00'))
		// Account
		url += `/accounts/${address}/assets`;
	// Contract
	else url += `/contracts/${address}`;

	return url;
};

export const bridgeUrl = `${config.browserUrl}/bridge`;

export const backendBrowserUrl = `https://backend.browser${config.environment === 'test' ? '.testnet' : ''}.partisiablockchain.com/graphql/query`;

export const shortLinkUrl = (domain: string) => `https://metanam.es/${domain}`;
