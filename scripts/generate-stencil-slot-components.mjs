/**
 * Generates Stencil wrappers for vanilla components that only mount
 * stylesheet + `.root` + default slot (see src/stack/stack.ts template).
 *
 * Usage: node scripts/generate-stencil-slot-components.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const stencilComponents = path.join(root, 'stencil', 'src', 'components');

async function exists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

function pascalSlug(slug) {
	return (
		'Bf' +
		slug
			.split('-')
			.map((s) => s.slice(0, 1).toUpperCase() + s.slice(1))
			.join('')
	);
}

function isPureSlotStub(txt) {
	if (!txt.includes("innerHTML = '<slot></slot>'")) return false;
	if (txt.includes('attributeChangedCallback')) return false;
	if (txt.includes('addEventListener')) return false;
	if (txt.includes('dispatchEvent')) return false;
	if (txt.includes('MutationObserver')) return false;
	const lines = txt.split(/\n/).length;
	return lines <= 42;
}

const stubTsx = (tagName, cmpName, baseFile) =>
	`import { Component, Host, h } from '@stencil/core';

@Component({
	tag: '${tagName}',
	styleUrl: '${baseFile}',
	shadow: true,
})
export class ${cmpName} {
	render() {
		return (
			<Host>
				<div class="root" part="root">
					<slot />
				</div>
			</Host>
		);
	}
}
`;

async function main() {
	await fs.mkdir(stencilComponents, { recursive: true });
	let created = 0;
	let skipped = 0;

	for (const ent of await fs.readdir(srcDir, { withFileTypes: true })) {
		if (!ent.isDirectory() || ent.name.startsWith('_')) continue;
		const slug = ent.name;
		if (slug === 'runtime') continue;

		const tsPath = path.join(srcDir, slug, `${slug}.ts`);
		if (!(await exists(tsPath))) continue;

		const text = await fs.readFile(tsPath, 'utf8');
		const def = [...text.matchAll(/customElements\.define\s*\(\s*['"](bf-[\w-]+)['"]/g)].pop();
		const tagName = def ? def[1] : `bf-${slug}`;
		const baseFile = `${tagName}.css`;
		const dir = path.join(stencilComponents, tagName);
		const tsxOut = path.join(dir, `${tagName}.tsx`);
		const cssFrom = path.join(srcDir, slug, `${slug}.css`);
		const cssTo = path.join(dir, baseFile);

		if (slug === 'button') {
			skipped++;
			continue;
		}

		if (!isPureSlotStub(text)) {
			skipped++;
			continue;
		}

		if (!(await exists(cssFrom))) continue;

		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(tsxOut, stubTsx(tagName, pascalSlug(slug), baseFile));
		await fs.copyFile(cssFrom, cssTo);
		created++;
	}

	console.log(
		`Stencil slot stubs: wrote ${created} components (skipped ${skipped} non-simple or button).`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
