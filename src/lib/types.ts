import type { BYOCSymbol } from '@metanames/sdk';

export enum DomainTab {
	details = 'details',
	settings = 'settings'
}

export interface AlertMessage {
	message: string;
	action?: {
		label: string;
		callback: () => void;
	};
}

export interface AccountData {
	id: string;
	account: {
		displayCoins: {
			symbol: string;
			balance: string;
			balanceAsGas: string;
			conversionRate: string;
		}[];
	};
}

export interface ApiError {
	error: string;
}

export interface DomainCheckResponse {
	domainPresent: boolean;
	parentPresent: boolean;
}

export interface DomainPaymentParams {
	domainName: string;
	byocSymbol: BYOCSymbol;
	years: number;
	address: string;
}

export interface DomainFeesResponse {
	feesLabel: number;
	fees: string;
	symbol: string;
	address: string;
}
