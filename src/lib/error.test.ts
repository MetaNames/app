import { describe, it, expect } from 'vitest';
import { InsufficientBalanceError } from './error';

describe('InsufficientBalanceError', () => {
	it('carries the coin that ran out', () => {
		expect(new InsufficientBalanceError('ETH').coin).toBe('ETH');
	});

	it('formats the message from the coin', () => {
		expect(new InsufficientBalanceError('MATIC').message).toBe('Insufficient balance for MATIC');
	});

	it('is named so it can be discriminated in a catch block', () => {
		expect(new InsufficientBalanceError('ETH').name).toBe('InsufficientBalanceError');
	});

	it('is an Error', () => {
		expect(new InsufficientBalanceError('ETH')).toBeInstanceOf(Error);
	});
});
