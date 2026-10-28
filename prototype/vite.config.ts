import react from '@vitejs/plugin-react';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const reactPkg = path.join(repoRoot, 'packages/react');
const themesSource = path.join(repoRoot, 'themes');
const prototypePublicThemes = path.join(here, 'public', 'themes');

function syncThemesPlugin(): Plugin {
	return {
		name: 'bareframe-sync-themes',
		async buildStart() {
			await fs.mkdir(prototypePublicThemes, { recursive: true });
			const entries = await fs.readdir(themesSource);
			for (const name of entries) {
				if (!name.endsWith('.css')) continue;
				await fs.copyFile(
					path.join(themesSource, name),
					path.join(prototypePublicThemes, name),
				);
			}
		},
	};
}

const pagesRoot = process.env.BAREFRAME_PAGES_ROOT === '1';

export default defineConfig({
	root: here,
	// Custom domain serves the app at https://bareframe.org/ (absolute asset URLs).
	base: pagesRoot ? '/' : './',
	plugins: [react(), syncThemesPlugin()],
	resolve: {
		alias: {
			'@bareframe/react': path.join(reactPkg, 'src/index.ts'),
		},
	},
	build: {
		outDir: path.join(repoRoot, 'public', 'prototype'),
		emptyOutDir: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('react-aria-components') || id.includes('@react-aria')) {
						return 'react-aria';
					}
					if (id.includes('/docs/examples/')) {
						const match = id.match(/docs\/examples\/([^/]+)\//);
						if (match) return `doc-examples-${match[1]}`;
					}
					if (id.includes('/components/library/registry')) {
						return 'component-registry';
					}
				},
			},
		},
	},
	server: {
		open: '/',
		fs: { allow: [repoRoot] },
		proxy: {
			'/api': {
				target: process.env.BAREFRAME_API_PROXY ?? 'http://127.0.0.1:8080',
				changeOrigin: true,
			},
		},
	},
});
