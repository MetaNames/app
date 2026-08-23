# Round 3 Alternatives — Claude's Ranked Plan

Source: Claude Opus 5 analysis, 2026-08-22 (sessions 329ba316, $1.77 + $0.76).

## Key insight: my polyfill narrowing failed silently

Vite externalized-module Proxy threw on property access; try/catch swallowed; Playwright's `toBeVisible` × 3 retries = 27 silent 20s hangs. Lesson: **replace implementations, don't remove them.**

## Baseline: 1919 KB shared, all routes

## Ranked plan

| Step | Option                                                                                                                     | Shared | Savings | Risk |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ---- |
| 0    | Harness: `reuseExistingServer:false`, clear `.vite`                                                                        | 1919   | —       | —    |
| 1    | Dedupe `bn.js` (all 6-7 copies are 4.12.x)                                                                                 | ~1690  | ~230    | none |
| 2    | Lazy-init Sentry (`requestIdleCallback` + dynamic import)                                                                  | ~1540  | ~150    | low  |
| 3    | Replace `nodePolyfills` with targeted alias layer (`@noble/*`, throwing named errors for keystore ops the app doesn't use) | ~1150  | ~390    | med  |
| 4    | Slim `tr46` (ASCII fast-path via alias)                                                                                    | ~970   | ~180    | med  |

**Total: −950 KB (−49%).** Axios replacement ruled out.

## Guardrails

1. Vitest smoke test calling `privateKeyToAccountAddress`, `deriveDigest`, `serializeTransaction` in jsdom
2. `retries: 0` locally during bisect
3. `rm -rf node_modules/.vite` before each e2e run
4. Commit per step with `npm run measure` numbers in message

## Erratum — Step 4 (`tr46` ASCII+NFC alias) is rejected

Reassessed empirically at HEAD `afa2ebe`, after Steps 0–3 landed. **Step 4 is a plan
defect and will not be implemented.** Steps 0–3 stand; the round ends at 1023 KB, not
~970 KB.

The step was written as a payload trade. It is not one: the proposed shim is not an
approximation of `tr46`, it is a different function with a different return type, and it
destroys domain validation outright.

### What the caller actually needs

One sink, reached only through `DomainValidator.normalize()`
(`@metanames/sdk/dist/validators/domain-validator.js:47`):

```js
const { domain, error } = toUnicode(name, { useSTD3ASCIIRules: true });
return error ? '' : domain;
```

`toASCII` is never called. Every call site in the app passes that identical option
object — no `checkHyphens`, `checkBidi`, `checkJoiners`, `verifyDNSLength`;
`processingOption` defaults to `nontransitional`.

`normalize()` fans out further than the step assumed. `validation()` calls it **twice**,
and the `Domain` model calls it in its **constructor**, so it runs once or twice per
domain rendered. Client-reachable entry points: `DomainSearch.svelte:23` (a reactive
statement — two `toUnicode` calls per keystroke, undebounced), the `[name]` route params
feeding `analyze`/`find` from `register/[name]/+page.svelte:69`,
`domain/[name]/+page.svelte:52` and the two universal `+page.ts` loaders, and
`profile/+page.svelte:34` via `findByOwner`.

### Defect 1 — wrong return type, so `normalize()` returns `undefined` for every input

Real `toUnicode` returns `{ domain, error }`. The proposed shim returns a bare `string`.
Destructuring a string yields `domain === undefined`, `error === undefined`.

Measured against the **real SDK** with `tr46` swapped in the require cache:

| input          | real `normalize()` | shim `normalize()`              |
| -------------- | ------------------ | ------------------------------- |
| `test`         | `"test"`           | `undefined`                     |
| `HELLO`        | `"hello"`          | `undefined`                     |
| `sub.test.mpc` | `"sub.test"`       | `undefined`                     |
| `test!@#`      | `""`               | THROW `Invalid domain: test!@#` |
| `münchen`      | `"münchen"`        | THROW `Invalid domain: münchen` |

`Domain`'s constructor does `[normalize(name), tld].join('.')`, so **every domain object
in the app is renamed `".mpc"`** with `nameWithoutTLD === ""` — measured, not inferred.
Profile listings, `/tld`, search results and every `/domain/<name>` link break at once.

### Defect 2 — throws where the contract is to flag

Real `toUnicode` never throws; it reports `error: true`. The shim throws a bare `Error`.
Nothing between it and the UI catches: `normalize()` has no `try`/`catch`, and
`DomainSearch.svelte:23` is a Svelte reactive statement, so the throw escapes during
flush. `{ raiseError: false }` does not help — the throw is from the shim, not from
`raiseErrors()`.

### Defect 3 — accepts names the validator must reject

Because `error` is always `undefined`, the `normalize(...) === ''` guard in `validation()`
can never fire. Inputs that flip **invalid → valid**: `.`, `xn--`, `xn--a`, `xn--0.pt`.

### Defect 4 — the ASCII/NFC split is not the IDNA mapping, and cannot be

`useSTD3ASCIIRules` is a per-code-point table lookup over all of Unicode, not a charset
test. Census of all 1,112,064 code points against real `tr46` with the SDK's exact
options:

| bucket                                                    | count       |
| --------------------------------------------------------- | ----------- |
| non-ASCII code points UTS-46 **accepts**                  | **146,334** |
| non-ASCII code points UTS-46 **rejects**                  | **965,602** |
| code points UTS-46 rewrites to something NFC never yields | **5,100**   |

Any shim without the table must pick one failure mode: reject the 146,334 (kills valid
IDN) or pass the 965,602 through (accepts disallowed code points — a homograph/spoofing
surface on a name-registration app). The proposed shim does the first for the STD3 path
and the second for the non-ASCII path, so it gets both. There is no middle ground: the
mapping table _is_ the semantics.

### Defect 5 — wrong export name

Shim exports `toAscii`; `tr46` exports `toASCII`. Currently latent because the SDK never
calls it; it would surface as `undefined is not a function` the day it does.

### Differential corpus result

112 inputs across ASCII, case folding, dots/separators, punycode, NFC/NFKC, IDNA
deviations, disallowed code points, ignored code points, joiners, bidi, hyphens, DNS
length, STD3, transitional/non-transitional and malformed input:

| level                       | mismatches vs real `tr46` |
| --------------------------- | ------------------------- |
| raw `toUnicode`             | 112 / 112 (100 %)         |
| `normalize()`               | 112 / 112 (100 %)         |
| `validation()` user verdict | **79 / 112 (70.5 %)**     |

### Gate behaviour — the unit suite is blind to this

With the shim aliased in, `npm run test:unit` passes **213/213**, including
`domain-validator.test.ts` (8/8) which asserts `normalize('HELLO') === 'hello'`. Vitest
externalizes `@metanames/sdk`, so the SDK's `require('tr46')` is resolved by Node and
never sees `resolve.alias` — the same blind spot documented for `crypto`/`assert` in
`vite.config.ts`. Only e2e catches it, and it does so hard:
`tests/e2e/domain-search.spec.ts` goes **3/3 failed** (1.1, 1.2, 1.3), including 1.2,
whose comment names tr46 STD3 as the mechanism under test.

### Payload context — the prize is a sixth of the headline

Measured by aliasing `tr46` to an inert stub and building:

| metric                | baseline | tr46 removed | delta       |
| --------------------- | -------- | ------------ | ----------- |
| SHARED (raw)          | 1023 KB  | 817 KB       | **−206 KB** |
| all client JS, gzip   | 1038 KB  | 978 KB       | **−60 KB**  |
| all client JS, brotli | 888 KB   | 855 KB       | **−33 KB**  |

The plan's ~180 KB is a raw-bytes figure. Over the wire the table is highly repetitive
and compresses ~5.4×: users actually download **~33 KB** less under brotli. That is 3.7 %
of the transferred bundle, in exchange for the validator.

### Rejected alternatives

- **Platform IDNA via `URL` host parsing** (zero payload; ICU in browsers, ada in Node).
  Best candidate, still rejected: 13/112 validator verdicts diverge (11.6 %), and the
  failures are the dangerous kind — URL host parsing **silently truncates** at its own
  delimiters. `a@b → "b"`, `a#b → "a"`, `a/b → "a"`, `a?b → "a"`, `a\b → "a"`, and
  `a≠b → "xn--ab-miv"`; all six flip invalid → valid. `alice@evil` normalizing to `evil`
  on a name-registration app is worse than either shipping the table or rejecting the
  name. Bare `0` also breaks (parsed as IPv4).
- **Prune `tr46`'s dead regexes.** With `checkHyphens`/`checkBidi`/`checkJoiners` all
  false, only `combiningMarks` is reachable; `combiningClassVirama`, `validZWNJ`,
  `bidiDomain` and `bidiS1LTR…bidiS6` are dead for this caller. Correct, and measured at
  61.8 KB raw — but only **5.4 KB brotli**, and it means forking a Unicode dependency and
  pinning the fork against upstream on the strength of an option set the SDK could change
  in a patch release. Not worth it. `mappingTable.json` — 135.6 KB raw, 24.9 KB brotli —
  is the rest, and is irreducible.
- **Defer `tr46` out of SHARED.** `normalize()` is synchronous, so the module cannot be
  lazily imported behind it. Making `$lib/stores/sdk` lazy would move the cost off the
  critical path, but all seven routes validate domain names, so nothing is saved — only
  delayed. That is a Round 4 architecture question, not a Step 4 alias.

### Decision

Keep `tr46@4.1.1`. 33 KB brotli does not buy a 70.5 % validation divergence, a validator
that throws into a reactive statement, and every domain in the UI renamed `.mpc`. Round 3
closes at **SHARED 1023 KB** (from 1919 KB, **−47 %**) across Steps 0–3.
