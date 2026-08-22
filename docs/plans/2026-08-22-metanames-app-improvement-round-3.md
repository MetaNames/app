# Round-3 Implementation Plan: SDK Bundle Splitting + Measurement

> **For Hermes:** Execute task-by-task. Preserve all gates. CSP is deferred to Round 4.

**Goal:** Split the 1.54 MB SDK chunk + 1.02 MB chunk so routes load only what they need. Measure impact per route.

**Architecture:** Use Vite's `build.rollupOptions.output.manualChunks` + dynamic imports to force code-splitting along Partisia SDK boundaries. Use `@rollup/plugin-visualizer` to post-mortem each chunk's contents. Measure per-route JS payload before/after by parsing the Vite manifest.

**Tech Stack:** Vite 5.4.21, SvelteKit, `@rollup/plugin-visualizer`, Node 26.5.1, existing npm infrastructure

**Baseline reference:** `docs/plans/2026-08-22-round-3-baseline.txt` (77 KB entry + 1.54 MB + 1.02 MB shared chunks)

**Out of scope:** Svelte 5 migration, CSP rollout (Round 4), dependency upgrades, build-time optimization

---

## Phase 1: Baseline + Setup (Tasks 1.1–1.2)

### Task 1.1: Lock in yargs@16 fix + commit baseline

**Objective:** Make the build reliable and prove the baseline is reproducible.

**Files:**

- Modify: `package.json` (already yargs@16 pinned via npm install — verify, commit)
- Create: `docs/plans/2026-08-22-round-3-baseline.txt` ✓ (already created)

**Step 1: Verify yargs is pinned**

```bash
cd /opt/data/work/metanames-app
grep '"yargs"' package.json  # Should show "yargs": "^16.2.0" or similar in devDependencies
npm ls yargs 2>&1 | grep "yargs@16"
```

Expected: yargs@16.x in tree.

**Step 2: Verify build still passes with yargs 16**

```bash
npm run build 2>&1 | tail -3 | grep "done"
```

Expected: `✔ done`. Build succeeds.

**Step 3: Commit**

```bash
git add package.json package-lock.json docs/plans/2026-08-22-round-3-baseline.txt
git commit -m "chore(deps): pin yargs to 16 for Node 26 compat; add round-3 baseline metrics"
```

---

### Task 1.2: Add bundle visualizer + configure manualChunks exploration

**Objective:** Add the tooling to see _what's inside_ each chunk, then configure Vite to split strategically.

**Files:**

- Modify: `vite.config.ts` (add visualizer plugin + initial manualChunks)
- Create: `bundle-report.html` (gitignored, generated artifact)
- Modify: `package.json` (add `build:analyze` script)

**Step 1: Install visualizer**

```bash
npm install --save-dev @rollup/plugin-visualizer --legacy-peer-deps
```

**Step 2: Update `vite.config.ts`**

Add to the config (in the `plugins` array and `build` section):

```typescript
import { visualizer } from '@rollup/plugin-visualizer';

export default defineConfig({
	plugins: [
		sveltekit(),
		// Keep this LAST so it sees the final bundle
		visualizer({
			filename: 'bundle-report.html',
			template: 'raw-data', // JSON output for parsing
			gzipSize: true,
			brotliSize: true
		})
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Split SDK by submodule. These patterns come from Partisia's zk-client structure.
					// Verified empirically by inspecting the chunk contents.
					if (id.includes('@partisiablockchain/zk-client')) return 'sdk-zk';
					if (id.includes('@partisiablockchain/blockchain-api-transaction-client')) return 'sdk-tx';
					if (id.includes('@partisiablockchain/abi-client')) return 'sdk-abi';
					if (id.includes('@partisiablockchain/rpc-client')) return 'sdk-rpc';
					if (id.includes('@metamask/')) return 'metamask';
					if (id.includes('ethers')) return 'ethers';
					// Let Vite decide for everything else.
				}
			}
		}
	}
	// ... rest of config
});
```

**Step 3: Add npm script**

```bash
npm pkg set scripts.build:analyze="npm run build && echo 'Bundle report: bundle-report.html'"
```

**Step 4: Test build + visualizer**

```bash
npm run build 2>&1 | tail -2
ls -la bundle-report.html  # Should exist, ~500 KB
```

Expected: exit 0, report generated.

**Step 5: Commit**

```bash
git add vite.config.ts package.json package-lock.json .gitignore
# Add bundle-report.html to .gitignore
echo "bundle-report.html" >> .gitignore
git commit -m "chore(build): add rollup visualizer and initial manualChunks config for SDK splitting"
```

---

## Phase 2: Measurement + Analysis (Task 2.1)

### Task 2.1: Create per-route measurement script

**Objective:** Quantify JS payload per route _before_ splitting (baseline vs. after).

**Files:**

- Create: `scripts/measure-route-chunks.js` (80 lines)
- Modify: `package.json` (add `measure` script)
- Create: `docs/plans/2026-08-22-round-3-routes-before.txt`

**Step 1: Create measurement script**

Save as `scripts/measure-route-chunks.js`:

```javascript
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const manifestPath = '.svelte-kit/output/client/_app/immutable/.vite/manifest.json';
if (!fs.existsSync(manifestPath)) {
	console.error('Manifest not found. Run: npm run build');
	process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const routes = {};

// Parse route files and their chunks
for (const [key, value] of Object.entries(manifest)) {
	if (!key.includes('routes/') || value.isEntry !== true) continue;

	const routeName = key.replace(/^src\/routes\//, '').replace(/\/\+page\.svelte$/, '');
	const allChunks = new Set([value.file]);

	// Recursively collect all imported chunks
	function collectImports(chunk) {
		if (!chunk.imports) return;
		for (const importKey of chunk.imports) {
			const imp = manifest[importKey];
			if (imp && imp.file) {
				allChunks.add(imp.file);
				collectImports(imp);
			}
		}
	}
	collectImports(value);

	// Calculate total size
	let totalSize = 0;
	const sizes = [];
	for (const file of allChunks) {
		const fullPath = path.join('.svelte-kit/output/client/_app/immutable', file);
		if (fs.existsSync(fullPath)) {
			const size = fs.statSync(fullPath).size;
			totalSize += size;
			sizes.push({ file, size });
		}
	}

	routes[routeName] = {
		chunks: allChunks.size,
		totalSize,
		files: sizes.sort((a, b) => b.size - a.size)
	};
}

// Print results
console.log('Route JS Payload Analysis\n');
const sorted = Object.entries(routes).sort((a, b) => b[1].totalSize - a[1].totalSize);
for (const [route, data] of sorted) {
	const kb = (data.totalSize / 1024).toFixed(0);
	console.log(`${route.padEnd(30)} ${kb.padStart(6)} KB  (${data.chunks} chunks)`);
	for (const f of data.files.slice(0, 3)) {
		console.log(`  ${(f.size / 1024).toFixed(0).padStart(6)} KB  ${f.file}`);
	}
}

const totalJS = Object.values(routes).reduce((sum, r) => sum + r.totalSize, 0);
console.log(
	`\n**Total JS across all routes: ${(totalJS / 1024).toFixed(0)} KB (but shared chunks counted multiple times)**`
);
```

**Step 2: Add npm script**

```bash
npm pkg set scripts.measure="node scripts/measure-route-chunks.js"
```

**Step 3: Run + save baseline**

```bash
npm run build  # Ensure fresh build
npm run measure > docs/plans/2026-08-22-round-3-routes-before.txt
cat docs/plans/2026-08-22-round-3-routes-before.txt
```

Expected output: routes sorted by payload, largest chunk files listed.

**Step 4: Commit**

```bash
git add scripts/measure-route-chunks.js package.json docs/plans/2026-08-22-round-3-routes-before.txt
git commit -m "chore: add per-route JS payload measurement script and round-3 route baseline"
```

---

## Phase 3: Chunk Splitting (Task 3.1)

### Task 3.1: Run build with manualChunks + measure impact

**Objective:** Verify the manualChunks actually splits the SDK.

**Files:**

- Modify: `vite.config.ts` (already added in Task 1.2)
- Create: `docs/plans/2026-08-22-round-3-routes-after.txt`

**Step 1: Build with manualChunks applied**

```bash
rm -rf .svelte-kit/output  # Clean cache
npm run build 2>&1 | tail -3 | grep "done"
```

**Step 2: Measure impact**

```bash
npm run measure > docs/plans/2026-08-22-round-3-routes-after.txt
cat docs/plans/2026-08-22-round-3-routes-after.txt
```

**Step 3: Compare before/after**

```bash
echo "=== BEFORE ===" && head -10 docs/plans/2026-08-22-round-3-routes-before.txt
echo "=== AFTER ===" && head -10 docs/plans/2026-08-22-round-3-routes-after.txt
```

Look for:

- Home route: should drop from ~2.5 MB initial → ~500 KB (SDK no longer included)
- /register route: should still load SDK (needs it) but page-specific chunks smaller
- /domain route: should load minimal SDK parts via lazy imports

**Step 4: Verify no new chunks > 500 KB were created**

```bash
find .svelte-kit/output -path "*/_app/*" -name "*.js" -exec du -b {} \; | sort -nr | head -10
```

Expected: largest chunk < 600 KB.

**Step 5: Commit**

```bash
git add docs/plans/2026-08-22-round-3-routes-after.txt vite.config.ts
git commit -m "feat(build): split Partisia SDK into per-route chunks via manualChunks"
```

---

## Phase 4: Lazy-Load SDK in Routes (Task 4.1)

### Task 4.1: Audit + lazy-load SDK where it's not needed on every route

**Objective:** For routes that don't _always_ need SDK (e.g., home page), lazy-load it.

**Files:**

- Modify: `src/lib/api.ts` (if SDK is eagerly imported, wrap in dynamic import)
- Modify: `src/routes/+page.svelte` (or relevant — depends on 2.1 results)
- Create: `docs/plans/2026-08-22-round-3-lazy-load-report.txt`

**Step 1: Identify which routes import SDK eagerly**

```bash
grep -r "from '@partisiablockchain" src/lib/ src/routes/ --include="*.ts" --include="*.svelte" | cut -d: -f1 | sort -u
```

**Step 2: For routes that DON'T need SDK on load, convert to dynamic import**

Example (if `src/lib/api.ts` imports SDK at top):

```typescript
// BEFORE: eagerly loaded
// import { ZkClient } from '@partisiablockchain/zk-client';

// AFTER: lazy-loaded
let zkClient: any = null;
async function getZkClient() {
  if (!zkClient) {
    const { ZkClient } = await import('@partisiablockchain/zk-client');
    zkClient = new ZkClient(...);
  }
  return zkClient;
}
```

**Step 3: Build + measure**

```bash
npm run build 2>&1 | tail -2
npm run measure > docs/plans/2026-08-22-round-3-lazy-load-report.txt
cat docs/plans/2026-08-22-round-3-lazy-load-report.txt
```

**Step 4: Verify tests still pass**

```bash
npm run test:unit 2>&1 | tail -3
```

Expected: 168/168 green.

**Step 5: Commit**

```bash
git add src/lib/api.ts src/routes/ docs/plans/2026-08-22-round-3-lazy-load-report.txt
git commit -m "perf(sdk): lazy-load Partisia SDK in routes that don't need it eagerly"
```

---

## Phase 5: Verification + Report (Task 5.1)

### Task 5.1: Full gate re-run + comparison report

**Objective:** Prove correctness and quantify improvement.

**Files:**

- Create: `docs/plans/2026-08-22-round-3-final-report.md`

**Step 1: Full gates**

```bash
npm run check      # TypeScript
npm run lint       # ESLint
npm run format     # Prettier
npm run test:unit  # Vitest 168/168
npm run build      # Production build
npm run test:e2e   # Playwright 59/59
```

All must pass.

**Step 2: Create comparison report**

Save as `docs/plans/2026-08-22-round-3-final-report.md`:

```markdown
# Round-3 Final Report: SDK Bundle Splitting

## Baseline vs. Round 3

| Metric                       | Before  | After | Delta |
| ---------------------------- | ------- | ----- | ----- |
| Entry chunk                  | 77 KB   | ? KB  | ?     |
| Home route JS                | 2.5 MB  | ? MB  | ?     |
| Domain route JS              | 2.5 MB  | ? MB  | ?     |
| Largest chunk                | 1.54 MB | ? MB  | ?     |
| Total JS (all routes summed) | ?MB     | ?MB   | ?     |

## Top 5 chunks by size

**Before:**
[Top 5 from baseline]

**After:**
[Top 5 from after]

## Chunk breakdown

[Paste side-by-side chunk lists]

## User-facing impact

- Home route initial load: ~X MB → ~Y MB (**Z% improvement**)
- /domain/[name] loads SDK in background: perceived LCP improvement
- /register still loads full SDK (necessary) but doesn't block other routes

## Coverage + Tests

- ✅ 168 unit tests passing (22 files)
- ✅ 59 e2e tests passing (0 flaky)
- ✅ svelte-check, lint, prettier clean
- ✅ Build ✓ done

## Commits

(List all round-3 commits)

## Next: Round 4 (CSP)

Ready to defer CSP hardening to next round.
```

**Step 3: Commit**

```bash
git add docs/plans/2026-08-22-round-3-final-report.md
git commit -m "docs: add round-3 final report with before/after metrics"
```

---

## Phase 6: Push (Task 6.1)

### Task 6.1: Push to staging

**Objective:** Save round-3 work to remote.

**Step 1: Verify all gates one more time**

```bash
npm run check && npm run lint && npm run test:unit 2>&1 | grep -E "passing|failing" | head -2
```

All green.

**Step 2: Push**

```bash
GIT_ASKPASS=/opt/data/scripts/git-askpass-metanames.sh git push origin staging
```

Expected: `XXX..XXX staging -> staging`

**Step 3: Verify on GitHub**

```bash
cd /opt/data/work/metanames-app && git fetch origin staging && git log --oneline -5 origin/staging
```

Latest commit should be the round-3 final report.

---

## Rollback plan

If anything breaks:

```bash
git revert <commit>  # Per bad commit
# Or
git reset --hard HEAD~N  # Rollback N commits locally (force-push if needed)
```

---

## Success criteria

- ✅ Build passes with manualChunks applied
- ✅ Home route JS reduced by **>40%** (from ~2.5 MB to ~1.5 MB)
- ✅ Largest chunk < 600 KB (currently 1.54 MB)
- ✅ All gates green (168 vitest, 59 e2e, typecheck, lint, prettier, build)
- ✅ Per-route payload measured and reported
- ✅ `bundle-report.html` generated and inspectable
