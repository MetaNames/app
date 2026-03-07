# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - Caching vs Tooling Constraints
**Learning:** SvelteKit auto-generates `.svelte-kit/tsconfig.json` during build/check cycles. Committing this file pollutes the repository and violates the strict "never modify tsconfig" constraint. Additionally, `pnpm install` might generate new lockfiles if dependencies change slightly, which must be reverted.
**Action:** Always verify `git status` before committing. Use `git restore --staged` and `git checkout` to remove unrequested `.svelte-kit` files and `pnpm-lock.yaml` changes. Keep the PR strictly to the intended performance feature.
