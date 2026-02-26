import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const versionsDir = path.join(publicDir, 'versions');
const distDir = path.join(root, 'dist');
const packageJsonPath = path.join(root, 'package.json');

function parseVersion(value) {
	const match = String(value).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
	if (!match) {
		return [0, 0, 0];
	}
	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function bySemverDesc(a, b) {
	const av = parseVersion(a);
	const bv = parseVersion(b);
	for (let i = 0; i < 3; i += 1) {
		if (av[i] !== bv[i]) {
			return bv[i] - av[i];
		}
	}
	return 0;
}

async function ensureVersionSnapshot(version) {
	const versionDir = path.join(versionsDir, version);
	await fs.mkdir(versionDir, { recursive: true });
	await fs.copyFile(
		path.join(distDir, 'bareframe.min.js'),
		path.join(versionDir, 'bareframe.min.js'),
	);
	await fs.copyFile(
		path.join(distDir, 'manifest.json'),
		path.join(versionDir, 'manifest.json'),
	);
	await fs.rm(path.join(versionDir, 'themes'), { recursive: true, force: true });
	await fs.cp(path.join(distDir, 'themes'), path.join(versionDir, 'themes'), { recursive: true });
}

function versionsIndexHtml(versions, latest) {
	const rows = versions
		.map((version) => {
			const latestBadge = version === latest ? ' <strong>(latest)</strong>' : '';
			return `<li><a href="./${version}/bareframe.min.js">${version}</a>${latestBadge} · <a href="./${version}/manifest.json">manifest</a> · <a href="./${version}/themes/system.css">themes</a></li>`;
		})
		.join('\n');

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>bareframe versions</title>
    <style>
      body { font-family: 'Avenir Next', 'Segoe UI', sans-serif; margin: 2rem; line-height: 1.45; }
      .layout { max-width: 820px; display: grid; gap: 1rem; }
      section { border: 1px solid #d1d5db; border-radius: 10px; padding: 1rem; background: #fff; }
      ul { margin: 0; padding-left: 1.1rem; }
      li { margin: 0.35rem 0; }
      code { background: #eef2f7; padding: 0.1rem 0.3rem; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="layout">
      <header>
        <h1>bareframe versions</h1>
        <p>Static versioned builds for GitHub Pages script includes.</p>
        <p><a href="../index.html">Back to public index</a></p>
      </header>

      <section>
        <h2>Latest</h2>
        <p><code>&lt;script type="module" src="https://samueldbines.github.io/bareframe/versions/${latest}/bareframe.min.js"&gt;&lt;/script&gt;</code></p>
        <p><code>&lt;link rel="stylesheet" href="https://samueldbines.github.io/bareframe/versions/${latest}/themes/system.css" /&gt;</code></p>
      </section>

      <section>
        <h2>All Versions</h2>
        <ul>
${rows}
        </ul>
      </section>
    </div>
  </body>
</html>
`;
}

async function main() {
	const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
	const version = pkg.version;

	await fs.mkdir(versionsDir, { recursive: true });
	await ensureVersionSnapshot(version);

	const entries = await fs.readdir(versionsDir, { withFileTypes: true });
	const versions = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.filter((name) => /^\d+\.\d+\.\d+$/.test(name))
		.sort(bySemverDesc);

	const latest = versions[0] || version;
	await fs.writeFile(path.join(versionsDir, 'index.html'), versionsIndexHtml(versions, latest));
	console.log(`Generated versions index with ${versions.length} version(s).`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
