import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = dirname(root);
mkdirSync(join(pkg, 'dist'), { recursive: true });
copyFileSync(join(pkg, 'src/styles/bareframe-ui.css'), join(pkg, 'dist/styles.css'));
