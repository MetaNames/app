# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2026-04-09 - Avoid side-effects when verifying performance changes
**Learning:** Running `pnpm install` or formatters can inadvertently introduce massive side effects like updating `pnpm-lock.yaml`, modifying `tsconfig.json`, or applying whitespace changes to dozens of static library files (`static/~@fontsource/...`). This creates bloated, unmergeable PRs.
**Action:** Always verify `git status` after running testing or formatting commands. Unstage everything, and use targeted `git add <file>` to exclusively stage only the files strictly modified for the performance optimization before committing.
