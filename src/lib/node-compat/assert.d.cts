/**
 * Types for assert.cjs. The implementation has to stay CommonJS so that a
 * `require('assert')` in a dependency gets a callable module — see the comment at the
 * top of assert.cjs — and `export =` is how that shape is described to TypeScript.
 */

declare class AssertionError extends Error {
	actual: unknown;
	expected: unknown;
	operator: string;

	constructor(message?: string, actual?: unknown, expected?: unknown, operator?: string);
}

interface AssertFn {
	(value: unknown, message?: string): asserts value;
	AssertionError: typeof AssertionError;
	ok(value: unknown, message?: string): asserts value;
	equal(actual: unknown, expected: unknown, message?: string): void;
	notEqual(actual: unknown, expected: unknown, message?: string): void;
	strictEqual(actual: unknown, expected: unknown, message?: string): void;
	notStrictEqual(actual: unknown, expected: unknown, message?: string): void;
	deepEqual(actual: unknown, expected: unknown, message?: string): void;
	deepStrictEqual(actual: unknown, expected: unknown, message?: string): void;
	fail(message?: string): never;
	strict: AssertFn;
}

declare const assert: AssertFn;

export = assert;
