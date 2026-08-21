# Meta Names App

The Meta Names app. Let you interact with the Smart Contract on Partisia Blockchain.

## Developing

Once you've installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
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
npm run build
```

You can preview the production build with `npm run preview`.
