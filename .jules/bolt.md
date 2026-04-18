# Bolt's Journal

## 2024-05-22 - Async Race Conditions

**Learning:** Asynchronous typeahead searches must implement a request ID mechanism. Without it, stale responses can overwrite newer ones, leading to correct search terms displaying incorrect results.
**Action:** Always use a request ID or cancellation token pattern when implementing async search/filter operations.

## 2024-10-25 - Svelte Input Debouncing

**Learning:** Using `on:keyup` for search input debouncing triggers unnecessary API calls on navigation keys (arrows, home, end) and misses changes from paste/cut. Svelte's reactive statements `$: debounce(value)` provide a robust, declarative way to trigger debouncing only when the value actually changes.
**Action:** Replace `on:keyup` handlers with reactive statements for input debouncing to improve performance and correctness.

## 2024-10-25 - Safe File Modifications

**Learning:** When executing auto-formatting tools like `svelte-kit sync`, the SvelteKit framework will automatically regenerate files within `.svelte-kit/` (such as `tsconfig.json`). These are ephemeral, auto-generated files and should not be added or committed to version control.
**Action:** Always verify `git status` after formatting or testing before making a commit to ensure only the intended source files are modified and staged. Use `git restore` to revert changes to auto-generated directories.
