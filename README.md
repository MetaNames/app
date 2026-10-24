# Meta Names App

The Meta Names app. Let you interact with the Smart Contract on Partisia Blockchain.

## Developing

Once you've installed dependencies with `pnpm install`, start a development server:

```bash
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev --open
```

## Quality gates

```bash
pnpm lint       # prettier --check + eslint
pnpm typecheck  # svelte-check
pnpm test:unit  # vitest, single run
pnpm test:coverage
pnpm test       # unit + playwright integration
```

Use `pnpm` (the version is pinned by `packageManager` in `package.json`; with
Corepack or pnpm itself it is picked up automatically). The lockfile is
`pnpm-lock.yaml`; lockfiles from other package managers are gitignored.

## Building

To create a production version of your app:

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.
