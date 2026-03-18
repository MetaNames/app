import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	walletAddress,
	walletConnected,
	alertMessage,
	alertTransaction,
	refresh
} from './stores/main';

describe('Stores - main', () => {
	beforeEach(() => {
		// Reset stores before each test
		walletAddress.set(undefined);
		alertMessage.set(undefined);
		alertTransaction.set(undefined);
		refresh.set(false);
	});

	describe('walletAddress', () => {
		it('should start as undefined', () => {
			expect(get(walletAddress)).toBeUndefined();
		});

		it('should update when set', () => {
			walletAddress.set('0x1234567890abcdef');
			expect(get(walletAddress)).toBe('0x1234567890abcdef');
		});

		it('should allow clearing to undefined', () => {
			walletAddress.set('0x1234567890abcdef');
			walletAddress.set(undefined);
			expect(get(walletAddress)).toBeUndefined();
		});
	});

	describe('walletConnected', () => {
		it('should be false when walletAddress is undefined', () => {
			walletAddress.set(undefined);
			expect(get(walletConnected)).toBe(false);
		});

		it('should be true when walletAddress is set', () => {
			walletAddress.set('0x1234567890abcdef');
			expect(get(walletConnected)).toBe(true);
		});

		it('should update reactively when walletAddress changes', () => {
			walletAddress.set(undefined);
			expect(get(walletConnected)).toBe(false);
			walletAddress.set('0xabcdef');
			expect(get(walletConnected)).toBe(true);
		});
	});

	describe('alertMessage', () => {
		it('should start as undefined', () => {
			expect(get(alertMessage)).toBeUndefined();
		});

		it('should store string messages', () => {
			alertMessage.set('Operation successful');
			expect(get(alertMessage)).toBe('Operation successful');
		});

		it('should store object messages', () => {
			const alert = { type: 'success' as const, message: 'Domain registered!' };
			alertMessage.set(alert);
			expect(get(alertMessage)).toEqual(alert);
		});
	});

	describe('alertTransaction', () => {
		it('should start as undefined', () => {
			expect(get(alertTransaction)).toBeUndefined();
		});

		it('should store transaction hash', () => {
			alertTransaction.set('0xabc123def456');
			expect(get(alertTransaction)).toBe('0xabc123def456');
		});

		it('should allow clearing', () => {
			alertTransaction.set('0xabc123def456');
			alertTransaction.set(undefined);
			expect(get(alertTransaction)).toBeUndefined();
		});
	});

	describe('refresh', () => {
		it('should start as false', () => {
			expect(get(refresh)).toBe(false);
		});

		it('should toggle state for triggering refreshes', () => {
			refresh.set(true);
			expect(get(refresh)).toBe(true);
			refresh.set(false);
			expect(get(refresh)).toBe(false);
		});
	});
});
