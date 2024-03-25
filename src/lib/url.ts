import { config } from './config';

export const explorerTransactionUrl = (transactionId: string) =>
	`${config.browserUrl}/transactions/${transactionId}`;

export const bridgeUrl = `${config.browserUrl}/bridge`;

export const backendBrowserUrl = `https://backend.browser${config.environment === 'test' ? '.testnet' : ''}.partisiablockchain.com/graphql/query`;

export const shortLinkUrl = (domain: string) => `https://metanam.es/${domain}`;
