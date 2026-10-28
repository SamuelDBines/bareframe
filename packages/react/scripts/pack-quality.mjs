#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const pkgDir = dirname(root);
const version = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
const packDir = join(pkgDir, '.pack-tmp');

execSync('pnpm run build', { cwd: pkgDir, stdio: 'inherit' });
execSync(`pnpm pack --pack-destination ${packDir}`, { cwd: pkgDir, stdio: 'inherit' });

const tarball = join(packDir, `bareframe-react-${version}.tgz`);

console.log('\n--- publint ---');
execSync(`pnpm exec publint --strict`, { cwd: pkgDir, stdio: 'inherit' });

console.log('\n--- @arethetypeswrong/cli ---');
execSync(`pnpm exec attw --pack ${tarball} --entrypoints .`, { cwd: pkgDir, stdio: 'inherit' });
