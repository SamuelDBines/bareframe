import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoPublic = path.resolve(here, '..', 'public');
const repoRoot = path.resolve(here, '..');

/** Warn when `pnpm run studio` prerequisites are missing. */
function studioDistPlugin(): Plugin {
	return {
		name: 'bareframe-studio-dist-check',
		configureServer(server) {
			server.httpServer?.once('listening', () => {
				const manifest = path.join(repoPublic, 'dist', 'manifest.json');
				if (existsSync(manifest)) return;
				const rel = path.relative(repoRoot, manifest);
				server.config.logger.warn(
					`\n  ⚠ Bareframe Studio needs a library build (${rel}). From repo root run:  pnpm run build\n`,
				);
			});
		},
	};
}

export default defineConfig(({ command }) => ({
	root: here,
	// Relative so /repo/showcase/ works on GitHub project Pages.
	base: './',
	plugins: [studioDistPlugin()],
	build: {
		outDir: path.join(repoPublic, 'showcase'),
		emptyOutDir: true,
	},
	server: {
		open: true,
		fs: {
			allow: [path.resolve(here, '..')],
		},
	},
	publicDir: command === 'serve' ? repoPublic : false,
}));
