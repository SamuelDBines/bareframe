import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const componentsFile = path.join(root, 'all-components.md');
const examplesDir = path.join(root, 'examples');

function slugify(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function categoryForSlug(slug) {
	const tokens = slug.split('-');
	const has = (value) => tokens.includes(value);
	const hasAny = (...values) => values.some((value) => has(value));

	if (
		hasAny(
			'input',
			'field',
			'textarea',
			'textfield',
			'search',
			'select',
			'combobox',
			'autocomplete',
			'color',
			'date',
			'number',
			'otp',
			'checkbox',
			'radio',
			'switch',
			'slider',
			'rating',
			'toggle',
		)
	) {
		return 'forms';
	}
	if (hasAny('chart', 'graph', 'heatmap', 'sparkline', 'gantt', 'treemap', 'gauge', 'canvas', 'map')) {
		return 'data';
	}
	if (hasAny('dialog', 'modal', 'drawer', 'sheet', 'bottom', 'popover', 'tooltip', 'toast', 'snackbar', 'alert', 'notification', 'banner')) {
		return 'overlay';
	}
	if (hasAny('nav', 'menu', 'breadcrumb', 'tab', 'pagination', 'toolbar', 'action', 'quick', 'navigation', 'link', 'anchor')) {
		return 'navigation';
	}
	if (hasAny('table', 'data', 'grid', 'list', 'tree', 'key', 'value', 'item')) {
		return 'collections';
	}
	if (hasAny('button', 'fab', 'chip', 'tag', 'badge', 'split', 'group')) {
		return 'actions';
	}
	return 'layout';
}

function relatedByCategory(category) {
	if (category === 'forms') {
		return ['bf-form-field', 'bf-input', 'bf-button'];
	}
	if (category === 'data') {
		return ['bf-card', 'bf-filter-bar', 'bf-segmented-control'];
	}
	if (category === 'overlay') {
		return ['bf-button', 'bf-alert', 'bf-toast'];
	}
	if (category === 'navigation') {
		return ['bf-nav', 'bf-breadcrumb', 'bf-menu'];
	}
	if (category === 'collections') {
		return ['bf-search', 'bf-pagination', 'bf-tag'];
	}
	if (category === 'actions') {
		return ['bf-button-group', 'bf-chip', 'bf-toggle'];
	}
	return ['bf-card', 'bf-header', 'bf-footer'];
}

function primaryDemo(tag, name, slug, category) {
	if (slug === 'avatar') {
		return `
<div class="stack">
  <div class="demo-row">
    <bf-avatar name="Samuel Bines" size="sm" status="online"></bf-avatar>
    <bf-avatar name="Morgan Lee" size="md" status="away"></bf-avatar>
    <bf-avatar name="Iris Chen" size="lg" status="busy"></bf-avatar>
    <bf-avatar name="Taylor Jordan" size="xl" status="offline"></bf-avatar>
  </div>
  <p class="hint">Avatar supports image, initials fallback, size, and status.</p>
</div>`.trim();
	}
	if (slug === 'autocomplete') {
		return `
<div class="stack">
  <${tag}
    placeholder="Search components..."
    options='["Accordion","Alert","Autocomplete","Button","Card","Data Grid","Dialog","Dropdown","Modal","Table","Tabs","Toast","Tooltip","Typography"]'
  ></${tag}>
  <p class="hint">Try typing: <code>to</code>, <code>tab</code>, <code>auto</code>. Use arrow keys + Enter to select.</p>
</div>`.trim();
	}
	if (slug === 'typography') {
		return `
<div class="stack">
  <bf-typography variant="display" as="h1">Display Heading</bf-typography>
  <bf-typography variant="h1" as="h2">Heading One</bf-typography>
  <bf-typography variant="h2" as="h3">Heading Two</bf-typography>
  <bf-typography variant="body" as="p">Body copy for longer form text blocks.</bf-typography>
  <bf-typography variant="caption" as="p">Caption metadata</bf-typography>
  <bf-typography variant="code" as="span">npm install bareframe</bf-typography>
</div>`.trim();
	}
	if (category === 'forms') {
		return `
<div class="stack">
  <label class="label">${name} Input</label>
  <${tag}>Value</${tag}>
  <p class="hint">Use this for reusable form flows with consistent validation styling.</p>
</div>`.trim();
	}
	if (category === 'data') {
		return `
<${tag}>
  <div class="viz">
    <div style="height: 30%"></div>
    <div style="height: 62%"></div>
    <div style="height: 44%"></div>
    <div style="height: 84%"></div>
    <div style="height: 58%"></div>
  </div>
</${tag}>`.trim();
	}
	if (category === 'overlay') {
		return `
<${tag}>
  <p><strong>${name}</strong> for contextual messages and focused interactions.</p>
  <div class="demo-row">
    <bf-button>Confirm</bf-button>
    <bf-button variant="secondary">Cancel</bf-button>
  </div>
</${tag}>`.trim();
	}
	if (category === 'navigation') {
		return `
<${tag}>
  <div class="demo-row">
    <a href="#">Overview</a>
    <a href="#">Projects</a>
    <a href="#">Settings</a>
    <a href="#">Billing</a>
  </div>
</${tag}>`.trim();
	}
	if (category === 'collections') {
		return `
<${tag}>
  <div class="tableish">
    <div><strong>Name</strong></div><div><strong>Status</strong></div>
    <div>Alpha</div><div>Active</div>
    <div>Bravo</div><div>Pending</div>
    <div>Charlie</div><div>Disabled</div>
  </div>
</${tag}>`.trim();
	}
	if (category === 'actions') {
		return `
<div class="demo-row">
  <${tag}>Primary</${tag}>
  <${tag}>Secondary</${tag}>
  <${tag}>Tertiary</${tag}>
</div>`.trim();
	}
	return `
<${tag}>
  <h3>${name}</h3>
  <p>Reusable component composition block.</p>
</${tag}>`.trim();
}

function relatedDemo(relatedTags) {
	return relatedTags
		.map((tag) => `<${tag}>${tag.replace('bf-', '')}</${tag}>`)
		.join('\n');
}

function pageHtml({ tag, name, desc, slug, category }) {
	const primary = primaryDemo(tag, name, slug, category);
	const related = relatedDemo(relatedByCategory(category));

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>bareframe ${slug} test</title>
    <link id="themeStylesheet" rel="stylesheet" href="../themes/system.css" />
    <style>
      body {
        font-family: 'Avenir Next', 'Segoe UI', sans-serif;
        margin: 2rem;
        line-height: 1.45;
        color: var(--bf-theme-text-1, #111827);
        background: var(--bf-theme-surface-2, #f8fafc);
      }

      .layout {
        display: grid;
        gap: 1rem;
        max-width: 980px;
      }

      .panel {
        border: 1px solid var(--bf-theme-border-1, #d1d5db);
        border-radius: 12px;
        background: var(--bf-theme-surface-1, #ffffff);
        padding: 1rem;
      }

      .theme-controls,
      .demo-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.7rem;
      }

      .stack { display: grid; gap: 0.5rem; }
      .label { font-weight: 600; }
      .hint { margin: 0; color: var(--bf-theme-text-2, #4b5563); }
      .tableish { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem 0.75rem; }
      .viz { display: flex; align-items: end; gap: 0.5rem; min-height: 120px; }
      .viz > div {
        width: 24px;
        background: var(--bf-theme-button-primary-bg, #2563eb);
        border-radius: 6px 6px 0 0;
      }
      code { background: rgba(148, 163, 184, 0.2); padding: 0.1rem 0.35rem; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="layout">
      <header>
        <h1>${tag}</h1>
        <p>${desc}</p>
      </header>

      <section class="panel">
        <div class="theme-controls">
          <label for="themeSelect">Theme</label>
          <select id="themeSelect">
            <option value="system">system</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="sprint">sprint</option>
          </select>
          <span id="themeStatus"></span>
        </div>
      </section>

      <section class="panel">
        <h2>Primary Demo</h2>
        ${primary}
      </section>

      <section class="panel">
        <h2>Related Components</h2>
        <div class="demo-row">
          ${related}
        </div>
      </section>

      <section class="panel">
        <h2>Tag</h2>
        <code>${tag}</code>
      </section>
    </div>

    <script type="module" src="../src/index.js"></script>
    <script type="module">
      const themeSelect = document.getElementById('themeSelect');
      const themeStatus = document.getElementById('themeStatus');
      const themeStylesheet = document.getElementById('themeStylesheet');

      function applyTheme(theme) {
        themeStylesheet.href = '../themes/' + theme + '.css';
        document.documentElement.setAttribute('data-bf-theme', theme);
        themeStatus.textContent = 'Active: ' + theme;
      }

      themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
      applyTheme('system');
    </script>
  </body>
</html>
`;
}

function indexHtml(files) {
	const links = files
		.sort((a, b) => a.localeCompare(b))
		.map((file) => `      <li><a href="./${file}">${file}</a></li>`)
		.join('\n');

	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>bareframe examples</title>
    <style>
      body { font-family: 'Avenir Next', 'Segoe UI', sans-serif; margin: 2rem; }
      ul { columns: 2; }
      li { margin: 0.35rem 0; }
    </style>
  </head>
  <body>
    <h1>bareframe examples</h1>
    <p>All examples default to <code>system</code> theme.</p>
    <ul>
${links}
    </ul>
  </body>
</html>
`;
}

async function main() {
	const raw = await fs.readFile(componentsFile, 'utf8');
	const lines = raw.split('\n');
	const components = lines
		.map((line) => line.match(/^- \*\*(.+)\*\*: (.+)$/))
		.filter(Boolean)
		.map(([, name, desc]) => ({ name, desc, slug: slugify(name), tag: `bf-${slugify(name)}` }));

	const files = [];
	for (const component of components) {
		const category = categoryForSlug(component.slug);
		const html = pageHtml({ ...component, category });
		const file = `${component.slug}-test.html`;
		await fs.writeFile(path.join(examplesDir, file), html);
		files.push(file);
	}

	await fs.writeFile(path.join(examplesDir, 'index.html'), indexHtml(files));
	console.log(`Generated ${files.length} example pages.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
