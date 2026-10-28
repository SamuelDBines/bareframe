#!/usr/bin/env node
/**
 * Installs the packed tarball in a throwaway Vite app outside the workspace
 * and verifies typecheck + production build with several components.
 */
import { execSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pkgDir = dirname(scriptDir);
const repoRoot = dirname(dirname(pkgDir));
const version = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
const packDir = join(pkgDir, '.pack-tmp');
const tarball = join(packDir, `bareframe-react-${version}.tgz`);

rmSync(packDir, { recursive: true, force: true });
mkdirSync(packDir, { recursive: true });

execSync('pnpm run build', { cwd: pkgDir, stdio: 'inherit' });
execSync(`pnpm pack --pack-destination ${packDir}`, { cwd: pkgDir, stdio: 'inherit' });

const appDir = join(tmpdir(), `bareframe-react-consumer-${Date.now()}`);
mkdirSync(appDir, { recursive: true });

console.log(`Creating consumer app at ${appDir}`);

execSync(
	'npm create vite@6.4.1 . -- --template react-ts',
	{ cwd: appDir, stdio: 'inherit', env: { ...process.env, npm_config_yes: 'true' } },
);

const pkg = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf8'));
pkg.dependencies['@bareframe/react'] = `file:${tarball}`;
writeFileSync(join(appDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);

execSync('npm install', { cwd: appDir, stdio: 'inherit' });

writeFileSync(
	join(appDir, 'src', 'App.tsx'),
	`import { useState } from 'react';
import '@bareframe/react/styles.css';
import '@bareframe/react/themes/light.css';
import {
	Alert,
	Badge,
	Button,
	Combobox,
	DatePicker,
	Input,
	Modal,
	Select,
} from '@bareframe/react';

const options = [
	{ value: 'a', label: 'Alpha' },
	{ value: 'b', label: 'Beta' },
];

export default function App() {
	const [open, setOpen] = useState(false);
	return (
		<main style={{ padding: '2rem', display: 'grid', gap: '1rem', maxWidth: 480 }}>
			<h1>Bareframe consumer smoke</h1>
			<Alert variant="info">Packed tarball import works.</Alert>
			<Badge>New</Badge>
			<Button data-testid="smoke-primary-btn" onPress={() => setOpen(true)}>Open modal</Button>
			<Input aria-label="Name" placeholder="Ada" />
			<Select aria-label="Pick one" options={options} defaultSelectedKey="a" />
			<Combobox label="Search" options={options} />
			<DatePicker label="Date" />
			<Modal isOpen={open} onOpenChange={setOpen} title="Smoke modal">
				<p>Modal content from @bareframe/react</p>
			</Modal>
		</main>
	);
}
`,
);

writeFileSync(
	join(appDir, 'src', 'main.tsx'),
	`import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
`,
);

execSync('npx tsc -b', { cwd: appDir, stdio: 'inherit' });
execSync('npm run build', { cwd: appDir, stdio: 'inherit' });

const distCss = execSync('find dist/assets -name "*.css" | head -1', {
	cwd: appDir,
	encoding: 'utf8',
}).trim();
if (!distCss) {
	throw new Error('consumer-smoke: expected CSS asset in Vite build output');
}
const css = readFileSync(join(appDir, distCss), 'utf8');
if (!css.includes('.bf-btn') && !css.includes('--bf-theme')) {
	throw new Error('consumer-smoke: Vite bundle missing Bareframe component CSS');
}

execSync('pnpm exec playwright install chromium', { cwd: repoRoot, stdio: 'inherit' });

const themeAssert = spawnSync(
	process.execPath,
	[join(scriptDir, 'consumer-theme-assert.mjs'), appDir, repoRoot],
	{ stdio: 'inherit', env: process.env },
);
if (themeAssert.status !== 0) {
	process.exit(themeAssert.status ?? 1);
}

console.log('consumer-smoke: typecheck, Vite build, and theme styling checks passed');
