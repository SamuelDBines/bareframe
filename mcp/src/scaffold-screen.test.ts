import path from 'node:path';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from './catalog.js';
import { scaffoldScreen } from './scaffold-screen.js';

const mcpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tscBin = path.join(mcpRoot, 'node_modules/typescript/bin/tsc');

function assertTsxTypechecks(source: string) {
	const dir = mkdtempSync(path.join(tmpdir(), 'bf-mcp-scaffold-'));
	writeFileSync(path.join(dir, 'Screen.tsx'), source);
	writeFileSync(
		path.join(dir, 'tsconfig.json'),
		JSON.stringify(
			{
				extends: path.join(mcpRoot, '../packages/design-handoff/tsconfig.scaffold.json'),
				include: ['Screen.tsx'],
			},
			null,
			2,
		),
	);
	try {
		execFileSync(tscBin, ['-p', path.join(dir, 'tsconfig.json')], {
			cwd: dir,
			stdio: 'pipe',
		});
	} catch (err) {
		const output = err instanceof Error && 'stdout' in err ? String((err as NodeJS.ErrnoException & { stdout: Buffer }).stdout) : String(err);
		throw new Error(output);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

describe('scaffold_screen generator', () => {
	const catalog = loadCatalog();

	it('rejects unknown themes', () => {
		expect(() => scaffoldScreen(catalog, { themeId: 'not-a-theme' })).toThrow(/Unknown theme/);
	});

	it('generates aurora delivery dashboard TSX that typechecks against @bareframe/react', () => {
		const result = scaffoldScreen(catalog, {
			intent: 'delivery operations dashboard',
			components: ['stat-card', 'card', 'table', 'badge', 'button'],
			themeId: 'aurora',
			title: 'Delivery overview',
		});
		expect(result.source).toContain("@bareframe/react/dist/styles.css");
		expect(result.source).toContain("@bareframe/react/themes/aurora.css");
		expect(result.componentsUsed.map((c) => c.slug)).toEqual([
			'stat-card',
			'card',
			'table',
			'badge',
			'button',
		]);
		assertTsxTypechecks(result.source);
	});

	it('maps login intent to form components', () => {
		const result = scaffoldScreen(catalog, { intent: 'Sign in to your account', themeId: 'light' });
		expect(result.componentsUsed.some((c) => c.slug === 'field')).toBe(true);
		assertTsxTypechecks(result.source);
	});
});
