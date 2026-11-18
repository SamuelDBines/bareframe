import { copyFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '..', 'dist');
const out = join(root, '..', 'bareframe-extension.zip');

execSync(`cd "${dist}" && zip -r "${out}" .`, { stdio: 'inherit' });
const publicDir = join(root, '..', '..', 'public', 'extension');
mkdirSync(publicDir, { recursive: true });
copyFileSync(out, join(publicDir, 'bareframe-extension.zip'));
console.log(`Wrote ${out}`);