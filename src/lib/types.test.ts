import { describe, it, expect } from 'vitest';
import { DomainTab } from './types';

describe('DomainTab', () => {
	it('exposes the details tab', () => {
		expect(DomainTab.details).toBe('details');
	});

	it('exposes the settings tab', () => {
		expect(DomainTab.settings).toBe('settings');
	});
});
