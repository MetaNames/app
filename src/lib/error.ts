import type { BYOCSymbol } from '@metanames/sdk';

export class InsufficientBalanceError extends Error {
	constructor(public coin: BYOCSymbol) {
		super(`Insufficient balance for ${coin}`);
		this.name = 'InsufficientBalanceError';
	}
}
