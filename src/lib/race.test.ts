import { describe, expect, it } from 'vitest';
import { trackLatest } from './race';

describe('trackLatest', () => {
	it('issues increasing ids', () => {
		const t = trackLatest();
		expect(t.next()).toBe(1);
		expect(t.next()).toBe(2);
	});

	it('accepts only the newest id and rejects superseded ones', () => {
		const t = trackLatest();
		const first = t.next();
		t.next();
		expect(t.check(first)).toBe(false);
		expect(t.check(t.next())).toBe(true);
	});

	it('starts fresh per instance (no shared state)', () => {
		const a = trackLatest();
		a.next();
		expect(trackLatest().next()).toBe(1);
	});
});
