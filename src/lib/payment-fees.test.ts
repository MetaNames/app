import { describe, it, expect } from 'vitest';
import { InsufficientBalanceError } from './error';
import {
	assertSufficientBalance,
	computeTotalFees,
	formatTotalFees,
	isStaleFeeResponse
} from './payment-fees';

/**
 * Characterization tests for the fee math that used to live inline in
 * DomainPayment.svelte:
 *
 * - `totalFeesLabel(label, years)` computed `label * years` and displayed
 *   `Math.ceil(total * 10000) / 10000`.
 * - `approveFees()` gated on `Number(accountCoin.balance) < totalFees`
 *   (strict less-than: an exact balance was allowed through).
 */
describe('computeTotalFees', () => {
	it.each([
		[0, 1],
		[10.5, 3]
	])('multiplies the yearly label by years (%i x %i)', (label, years) => {
		expect(computeTotalFees(label, years)).toBe(label * years);
	});

	it('scales linearly across year counts', () => {
		expect(computeTotalFees(2, 1)).toBe(2);
		expect(computeTotalFees(2, 2)).toBe(4);
		expect(computeTotalFees(2, 5)).toBe(10);
	});

	it('keeps floating-point residue unrounded — rounding is display-only', () => {
		expect(computeTotalFees(0.1, 3)).toBeCloseTo(0.30000000000000004);
	});
});

describe('formatTotalFees', () => {
	it('rounds up to four decimal places for display', () => {
		expect(formatTotalFees(Math.ceil(12.00001 * 10000) / 10000)).toBe(12.0001);
	});

	it('leaves clean totals untouched', () => {
		expect(formatTotalFees(31.5)).toBe(31.5);
	});

	it('matches the old component output for fractional labels', () => {
		const total = computeTotalFees(10.333333, 2);
		expect(formatTotalFees(total)).toBe(Math.ceil(total * 10000) / 10000);
	});
});

describe('assertSufficientBalance', () => {
	it('passes when the balance exceeds the total', () => {
		expect(() => assertSufficientBalance('5', 2, 'ETH')).not.toThrow();
	});

	it('throws InsufficientBalanceError carrying the coin when short', () => {
		try {
			assertSufficientBalance('1', 2, 'MATIC');
			expect.unreachable('should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(InsufficientBalanceError);
			expect((error as InsufficientBalanceError).coin).toBe('MATIC');
		}
	});

	it('allows an exact-boundary balance (strict <, matching the old gate)', () => {
		expect(() => assertSufficientBalance('2', 2, 'ETH')).not.toThrow();
	});

	it('compares numerically, so string balances from chain data work', () => {
		// Note IEEE-754: '1.999999999999999999' rounds to 2 and passes — same as
		// the old `Number(balance) < totalFees` check.
		expect(() => assertSufficientBalance('2.000000000000000001', 2, 'ETH')).not.toThrow();
		expect(() => assertSufficientBalance('0.5', 2, 'ETH')).toThrow(InsufficientBalanceError);
	});

	it('treats a zero balance as insufficient for any nonzero fee', () => {
		expect(() => assertSufficientBalance('0', 0.5, 'ETH')).toThrow(InsufficientBalanceError);
	});

	it('allows a zero fee regardless of balance', () => {
		expect(() => assertSufficientBalance('0', 0, 'ETH')).not.toThrow();
	});
});

describe('isStaleFeeResponse', () => {
	// Guards the DomainPayment race: a slow older fetch (Retry or coin switch)
	// must not overwrite the state written by a newer request.
	it('accepts a response from the newest request for the current coin', () => {
		expect(isStaleFeeResponse(3, 3, 'ETH', 'ETH')).toBe(false);
	});

	it('rejects a response from an older generation (superseded Retry)', () => {
		expect(isStaleFeeResponse(2, 3, 'ETH', 'ETH')).toBe(true);
	});

	it('rejects a response for a different coin than the one now selected', () => {
		expect(isStaleFeeResponse(1, 1, 'ETH', 'MATIC')).toBe(true);
	});

	it('rejects when both generation and coin have moved on', () => {
		expect(isStaleFeeResponse(2, 4, 'ETH', 'MATIC')).toBe(true);
	});

	it('does not confuse generation 0 with an unset guard', () => {
		expect(isStaleFeeResponse(0, 0, 'ETH', 'ETH')).toBe(false);
		expect(isStaleFeeResponse(0, 1, 'ETH', 'ETH')).toBe(true);
	});
});
