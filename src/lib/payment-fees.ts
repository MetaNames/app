import type { BYOCSymbol } from '@metanames/sdk';
import { InsufficientBalanceError } from './error';

/**
 * Pure fee derivation for the DomainPayment flow.
 *
 * These were previously inline in DomainPayment.svelte: `totalFeesLabel`
 * multiplied the yearly label by years and smuggled a store write into render,
 * and `approveFees` read that store back to gate the balance check. The math is
 * unchanged — it just lives somewhere testable and side-effect-free now.
 */

/** Yearly fee × registration length. Unrounded; rounding is display-only. */
export function computeTotalFees(feesLabel: number, years: number): number {
	return feesLabel * years;
}

/** Display form: round up to four decimals, exactly as the component rendered before. */
export function formatTotalFees(total: number): number {
	return Math.ceil(total * 10000) / 10000;
}

/**
 * Balance gate for approving fees: throws when the account cannot cover the
 * total. Strictly less-than passes at exact equality, matching the original
 * inline check in `approveFees`.
 */
export function assertSufficientBalance(
	balance: string | number,
	totalFees: number,
	coin: BYOCSymbol
): void {
	if (Number(balance) < totalFees) throw new InsufficientBalanceError(coin);
}
