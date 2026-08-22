# Round 3 Alternatives — Claude's Ranked Plan

Source: Claude Opus 5 analysis, 2026-08-22 (sessions 329ba316, $1.77 + $0.76).

## Key insight: my polyfill narrowing failed silently
Vite externalized-module Proxy threw on property access; try/catch swallowed; Playwright's `toBeVisible` × 3 retries = 27 silent 20s hangs. Lesson: **replace implementations, don't remove them.**

## Baseline: 1919 KB shared, all routes

## Ranked plan
| Step | Option | Shared | Savings | Risk |
|---|---|---|---|---|
| 0 | Harness: `reuseExistingServer:false`, clear `.vite` | 1919 | — | — |
| 1 | Dedupe `bn.js` (all 6-7 copies are 4.12.x) | ~1690 | ~230 | none |
| 2 | Lazy-init Sentry (`requestIdleCallback` + dynamic import) | ~1540 | ~150 | low |
| 3 | Replace `nodePolyfills` with targeted alias layer (`@noble/*`, throwing named errors for keystore ops the app doesn't use) | ~1150 | ~390 | med |
| 4 | Slim `tr46` (ASCII fast-path via alias) | ~970 | ~180 | med |

**Total: −950 KB (−49%).** Axios replacement ruled out.

## Guardrails
1. Vitest smoke test calling `privateKeyToAccountAddress`, `deriveDigest`, `serializeTransaction` in jsdom
2. `retries: 0` locally during bisect
3. `rm -rf node_modules/.vite` before each e2e run
4. Commit per step with `npm run measure` numbers in message
