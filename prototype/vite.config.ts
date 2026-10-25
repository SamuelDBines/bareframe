import react from '@vitejs/plugin-react';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
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
	build: {
		outDir: path.join(repoRoot, 'public', 'prototype'),
		emptyOutDir: true,
	},
	server: {
		open: '/',
		fs: { allow: [repoRoot] },
	},
});
