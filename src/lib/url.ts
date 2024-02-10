import { config } from "./config";

export const explorerTransactionUrl = (transactionId: string) =>
  `${config.browserUrl}/transactions/${transactionId}`;

export const bridgeUrl = `${config.browserUrl}/bridge`;
