/**
 * npm run optimize:models
 * Compresses every raw model  models-src/<episode>/<name>.glb  (git-ignored)
 * into                        src/episodes/<episode>/assets/<name>.glb  (committed),
 * with meshopt geometry, WebP textures and a 1024 px texture cap.
 * The CLI is fetched on demand by npx, so it is not a project dependency.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = '@gltf-transform/cli@4.5.1';
/** Names are passed to a shell on Windows, so only plain file names are accepted. */
const SAFE_NAME = /^[\w.-]+$/;

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(root, 'models-src');
if (!existsSync(sourceRoot)) {
  console.log('Nothing to do: put raw models in models-src/<episode>/<name>.glb first.');
  process.exit(0);
}

let failed = 0;
for (const episode of readdirSync(sourceRoot)) {
  const sourceDir = join(sourceRoot, episode);
  if (!statSync(sourceDir).isDirectory()) continue;
  for (const file of readdirSync(sourceDir).filter((name) => name.endsWith('.glb'))) {
    if (!SAFE_NAME.test(episode) || !SAFE_NAME.test(file)) {
      console.error(`Skipped "${episode}/${file}": use only letters, digits, dots, dashes and underscores.`);
      failed++;
      continue;
    }
    const outDir = join(root, 'src', 'episodes', episode, 'assets');
    mkdirSync(outDir, { recursive: true });
    const input = join(sourceDir, file);
    const output = join(outDir, file);
    console.log(`\n${episode}/${file}`);
    const args = ['--yes', CLI, 'optimize', input, output, '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024'];
    const run = spawnSync('npx', args.map((a) => `"${a}"`), { stdio: 'inherit', shell: true });
    if (run.status !== 0) {
      failed++;
      continue;
    }
    const before = statSync(input).size;
    const after = statSync(output).size;
    console.log(`  ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
  }
}
process.exit(failed > 0 ? 1 : 0);
