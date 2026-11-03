import { cpSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
mkdirSync(path.join(root, 'dist', 'schemas'), { recursive: true });
for (const name of [
  'bareframe.package.v1.0.schema.json',
  'define.requirements.v1.0.schema.json',
  'design.spec.v1.0.schema.json',
]) {
  cpSync(path.join(root, 'schemas', name), path.join(root, 'dist', 'schemas', name));
}
