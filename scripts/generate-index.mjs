import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const indexPath = path.join(srcDir, 'index.js');

async function exists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function main() {
	const entries = await fs.readdir(srcDir, { withFileTypes: true });
	const slugs = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}
		if (entry.name.startsWith('_')) {
			continue;
		}
		const slug = entry.name;
		const jsPath = path.join(srcDir, slug, `${slug}.js`);
		const cssPath = path.join(srcDir, slug, `${slug}.css`);
		if ((await exists(jsPath)) && (await exists(cssPath))) {
			slugs.push(slug);
		}
	}

	slugs.sort();
	const lines = slugs.map((slug) => `import './${slug}/${slug}.js';`);
	lines.push('');
	await fs.writeFile(indexPath, lines.join('\n'));
	console.log(`Generated src/index.js with ${slugs.length} components.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
