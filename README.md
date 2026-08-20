# Meta Names App

The Meta Names app. Let you interact with the Smart Contract on Partisia Blockchain.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
yarn run dev

# or start the server and open the app in a new browser tab
yarn run dev -- --open
```

## Quality gates

```bash
npm run lint       # prettier --check + eslint
npm run typecheck  # svelte-check
npm run test:unit  # vitest, single run
npm run test:coverage
npm test           # unit + playwright integration
```

Use `npm`, not `yarn`: the repo's lockfile is `package-lock.json`, and `yarn check`
is shadowed by Yarn's built-in dependency checker so it never runs svelte-check.

## Building

To create a production version of your app:

```bash
yarn run build
```

You can preview the production build with `yarn run preview`.
