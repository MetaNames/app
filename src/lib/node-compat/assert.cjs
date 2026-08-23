'use strict';

/**
 * Node's `assert`, reduced to what the Partisia libraries actually call.
 *
 * This file is CommonJS on purpose, and that is the whole reason it exists in this
 * shape. `partisia-blockchain-applications-rpc/lib/main/accountInfo.js` does
 *
 *     var assert = require('assert');
 *     ...
 *     assert(res.data.finalized);
 *
 * — it calls the *module itself*, not a `.default` property. When this shim was an ES
 * module, Vite's dependency pre-bundler compiled that require into
 * `__toCommonJS(assert_exports)`, which is a plain namespace object and therefore not
 * callable, so the call threw `TypeError: assert is not a function`. That one call site
 * sits inside `getTransactionForce`'s `while (true)` with a bare `catch` that only
 * sleeps 500 ms, so the TypeError never surfaced: it turned into an infinite poll loop.
 * `intent.fetchResult` never settled, `feesApproved` stayed false, and the only visible
 * symptom was a "Register domain" button that stayed disabled until Playwright gave up.
 *
 * A `.cjs` extension makes esbuild and Rollup both bind `require('assert')` straight to
 * `module.exports`, so the module is callable again. Every other consumer
 * (partisia-blockchain-applications-crypto, @metanames/sdk) goes through
 * `__importDefault(require('assert')).default`, which keeps working either way.
 *
 * Types live in assert.d.cts; keep the two in step.
 */

class AssertionError extends Error {
	constructor(message, actual, expected, operator) {
		super(message ?? 'assertion failed');
		this.name = 'AssertionError';
		this.actual = actual;
		this.expected = expected;
		this.operator = operator ?? '==';
	}
}

function assert(value, message) {
	if (!value) throw new AssertionError(message ?? 'assertion failed', value, true, '==');
}

function ok(value, message) {
	assert(value, message);
}

// `equal`/`notEqual` compare loosely on purpose: that is Node's documented
// behaviour for them, and `strictEqual` is the `===` variant right below.
function equal(actual, expected, message) {
	if (actual != expected) throw new AssertionError(message, actual, expected, '==');
}

function notEqual(actual, expected, message) {
	if (actual == expected) throw new AssertionError(message, actual, expected, '!=');
}

function strictEqual(actual, expected, message) {
	if (actual !== expected) throw new AssertionError(message, actual, expected, '===');
}

function notStrictEqual(actual, expected, message) {
	if (actual === expected) throw new AssertionError(message, actual, expected, '!==');
}

function isDeepEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (typeof a !== typeof b) return false;
	if (typeof a !== 'object') return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((v, i) => isDeepEqual(v, b[i]));
	}
	const ka = Object.keys(a);
	const kb = Object.keys(b);
	if (ka.length !== kb.length) return false;
	return ka.every((k) => isDeepEqual(a[k], b[k]));
}

function deepEqual(actual, expected, message) {
	if (!isDeepEqual(actual, expected))
		throw new AssertionError(
			message ?? 'values are not deeply equal',
			actual,
			expected,
			'deepEqual'
		);
}

function fail(message) {
	throw new AssertionError(message ?? 'explicit fail');
}

// Mimic Node's callable-with-properties shape so `assert(x)` and
// `assert.strictEqual(a, b)` both work.
module.exports = assert;
module.exports.AssertionError = AssertionError;
module.exports.ok = ok;
module.exports.equal = equal;
module.exports.notEqual = notEqual;
module.exports.strictEqual = strictEqual;
module.exports.notStrictEqual = notStrictEqual;
module.exports.deepEqual = deepEqual;
module.exports.deepStrictEqual = deepEqual;
module.exports.fail = fail;
module.exports.strict = assert;
