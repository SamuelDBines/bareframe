import { copyFileSync, cpSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = dirname(root);
const repoThemes = join(pkg, '../../themes');
const dist = join(pkg, 'dist');
const distThemes = join(dist, 'themes');

mkdirSync(dist, { recursive: true });
copyFileSync(join(pkg, 'src/styles/bareframe-ui.css'), join(dist, 'styles.css'));

mkdirSync(distThemes, { recursive: true });
for (const name of readdirSync(repoThemes)) {
	if (!name.endsWith('.css')) continue;
	cpSync(join(repoThemes, name), join(distThemes, name));
}

console.log(`copy-css: styles.css + ${readdirSync(distThemes).length} theme files → dist/themes/`);
