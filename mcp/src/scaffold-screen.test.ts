import path from 'node:path';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from './catalog.js';
import { scaffoldScreen } from './scaffold-screen.js';

const mcpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(mcpRoot, '..');
const reactTypes = path.join(repoRoot, 'packages/react/dist/index.d.ts');
const tscBin = path.join(mcpRoot, 'node_modules/typescript/bin/tsc');
const scaffoldTsconfig = path.join(mcpRoot, 'tsconfig.scaffold.json');
const fixtureDir = path.join(mcpRoot, 'test-fixtures/scaffold-check');
const fixtureFile = path.join(fixtureDir, 'Screen.tsx');

function assertTsxTypechecks(source: string) {
  if (!existsSync(reactTypes)) {
    throw new Error(
      `Missing ${reactTypes}. Run pnpm run build:react (or pnpm run mcp:build) before MCP tests.`,
    );
  }
  mkdirSync(fixtureDir, { recursive: true });
  writeFileSync(fixtureFile, source);
  try {
    execFileSync(tscBin, ['-p', scaffoldTsconfig], {
      cwd: mcpRoot,
      stdio: 'pipe',
    });
  } catch (err) {
    const output =
      err instanceof Error && 'stdout' in err
        ? String((err as NodeJS.ErrnoException & { stdout: Buffer }).stdout)
        : String(err);
    throw new Error(output);
  } finally {
    rmSync(fixtureFile, { force: true });
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
    expect(result.source).toContain('@bareframe/react/dist/styles.css');
    expect(result.source).toContain('@bareframe/react/themes/aurora.css');
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
