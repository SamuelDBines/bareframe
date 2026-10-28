import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = dirname(root);
const repoThemes = join(pkg, '../../themes');
const dist = join(pkg, 'dist');
const distThemes = join(dist, 'themes');
const stylesDir = join(pkg, 'src/styles');

mkdirSync(dist, { recursive: true });

const ui = readFileSync(join(stylesDir, 'bareframe-ui.css'), 'utf8');
const button = readFileSync(join(stylesDir, 'button.css'), 'utf8');
writeFileSync(join(dist, 'styles.css'), `${ui}\n${button}`);

mkdirSync(distThemes, { recursive: true });
for (const name of readdirSync(repoThemes)) {
	if (!name.endsWith('.css')) continue;
	cpSync(join(repoThemes, name), join(distThemes, name));
}

console.log(`copy-css: styles.css (ui + button) + ${readdirSync(distThemes).length} theme files → dist/themes/`);
