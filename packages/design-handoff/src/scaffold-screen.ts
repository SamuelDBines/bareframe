import type { Catalog, ComponentRecord } from './types.js';

export type ScaffoldScreenInput = {
	intent?: string;
	components?: string[];
	themeId?: string;
	title?: string;
};

export type ScaffoldScreenResult = {
	themeId: string;
	cssImport: string;
	stylesImport: string;
	componentsUsed: { slug: string; reactExport: string }[];
	intent: string;
	filename: string;
	source: string;
	notes: string[];
};

const DEFAULT_THEME = 'light';

const INTENT_COMPONENTS: { pattern: RegExp; slugs: string[] }[] = [
	{ pattern: /login|sign[\s-]?in|log[\s-]?in|auth/i, slugs: ['field', 'input', 'button', 'checkbox'] },
	{ pattern: /dashboard|analytics|overview/i, slugs: ['stat-card', 'card', 'table', 'badge'] },
	{ pattern: /settings|preferences|profile/i, slugs: ['field', 'input', 'switch', 'button'] },
	{ pattern: /checkout|payment|billing/i, slugs: ['card', 'field', 'input', 'button'] },
	{ pattern: /empty|onboarding|welcome/i, slugs: ['empty-state', 'button'] },
	{ pattern: /form|submit|contact/i, slugs: ['field', 'input', 'textarea', 'button'] },
];

function humanize(slug: string): string {
	return slug
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

function pickComponents(catalog: Catalog, input: ScaffoldScreenInput): {
	slugs: string[];
	notes: string[];
} {
	const notes: string[] = [];
	let slugs = (input.components ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);

	if (slugs.length === 0 && input.intent) {
		for (const rule of INTENT_COMPONENTS) {
			if (rule.pattern.test(input.intent)) {
				slugs = rule.slugs;
				notes.push(`Matched intent to suggested components: ${slugs.join(', ')}`);
				break;
			}
		}
	}

	if (slugs.length === 0) {
		slugs = ['card', 'button'];
		notes.push('No components matched; using card + button defaults.');
	}

	const resolved: string[] = [];
	for (const slug of slugs) {
		const record = catalog.components.find((c) => c.slug === slug);
		if (!record) {
			notes.push(`Skipped unknown slug "${slug}".`);
			continue;
		}
		if (!record.reactExport) {
			notes.push(`Skipped "${slug}" (no @bareframe/react export yet; use web component docs).`);
			continue;
		}
		if (record.stability === 'experimental') {
			notes.push(`Included experimental component "${slug}" — verify API before shipping.`);
		}
		resolved.push(slug);
	}

	if (resolved.length === 0) {
		const fallback = catalog.components.find((c) => c.slug === 'button' && c.reactExport);
		if (fallback) resolved.push('button');
		notes.push('Fell back to Button only.');
	}

	return { slugs: [...new Set(resolved)], notes };
}

function blockFor(record: ComponentRecord, index: number): string {
	const exportName = record.reactExport!;
	switch (record.slug) {
		case 'button':
			return `      <Button variant="${index === 0 ? 'primary' : 'secondary'}">Continue</Button>`;
		case 'field':
			return `      <Field label="Email" hint="We'll never share your email." />`;
		case 'input':
			return `      <Input placeholder="Search…" aria-label="Search" />`;
		case 'textarea':
			return `      <Textarea placeholder="Add a note…" aria-label="Note" rows={4} />`;
		case 'checkbox':
			return `      <Checkbox label="Remember this device" defaultChecked />`;
		case 'switch':
			return `      <Switch label="Email notifications" defaultChecked />`;
		case 'card':
			return `      <Card title="${humanize(record.slug)} section" footer="Updated just now">
        Placeholder content for your ${humanize(record.slug).toLowerCase()} layout.
      </Card>`;
		case 'stat-card':
			return `      <StatCard label="Active deliveries" value="128" delta="+12%" />`;
		case 'table':
			return `      <Table />`;
		case 'badge':
			return `      <Badge variant="success">On time</Badge>`;
		case 'empty-state':
			return `      <EmptyState
        title="Nothing here yet"
        description="Create your first item to get started."
        actionLabel="Create item"
      />`;
		case 'alert':
			return `      <Alert variant="info" title="Heads up">
        This screen was scaffolded from MCP — replace copy and wire real data.
      </Alert>`;
		default:
			return `      <${exportName}>${humanize(record.slug)} preview</${exportName}>`;
	}
}

export function scaffoldScreen(catalog: Catalog, input: ScaffoldScreenInput): ScaffoldScreenResult {
	const themeId = (input.themeId ?? DEFAULT_THEME).toLowerCase();
	const theme = catalog.themes.find((t) => t.id === themeId);
	if (!theme) {
		throw new Error(`Unknown theme id: ${themeId}`);
	}

	const intent = input.intent?.trim() || 'Custom screen';
	const title = input.title?.trim() || intent.replace(/[^\w\s-]/g, '').trim() || 'Screen';
	const { slugs, notes } = pickComponents(catalog, input);

	const used = slugs
		.map((slug) => catalog.components.find((c) => c.slug === slug))
		.filter((c): c is ComponentRecord => Boolean(c && c.reactExport));

	const imports = [...new Set(used.map((c) => c.reactExport!))].sort();

	const body = used.map((record, i) => blockFor(record, i)).join('\n');

	const themeImport = `@bareframe/react/themes/${theme.id}.css`;
	const source = `import '@bareframe/react/dist/styles.css';
import '${themeImport}';

import {
  ${imports.join(',\n  ')}
} from '@bareframe/react';

export default function ${toComponentName(title)}() {
  return (
    <main
      data-bf-theme="${theme.id}"
      style={{
        minHeight: '100vh',
        padding: 'var(--bf-theme-space-3, 1rem)',
        fontFamily: 'var(--bf-theme-font-family, system-ui, sans-serif)',
        color: 'var(--bf-theme-text-1, inherit)',
        background: 'var(--bf-theme-surface-1, #fff)',
      }}
    >
      <header style={{ marginBottom: 'var(--bf-theme-space-3, 1rem)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--bf-theme-typography-h1-size, 1.75rem)' }}>
          {${JSON.stringify(title)}}
        </h1>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--bf-theme-text-2, #555)' }}>
          Scaffolded layout — connect real data and routes in your app.
        </p>
      </header>
      <section
        aria-label={${JSON.stringify(`${title} content`)}}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--bf-theme-space-2, 0.75rem)',
          maxWidth: '48rem',
        }}
      >
${body}
      </section>
    </main>
  );
}
`;

	return {
		themeId: theme.id,
		cssImport: theme.cssImport,
		stylesImport: '@bareframe/react/dist/styles.css',
		componentsUsed: used.map((c) => ({ slug: c.slug, reactExport: c.reactExport! })),
		intent,
		filename: `${toFileName(title)}.tsx`,
		source,
		notes,
	};
}

function toComponentName(title: string): string {
	const cleaned = title.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
	const parts = cleaned.split(/\s+/).filter(Boolean);
	if (parts.length === 0) return 'ScaffoldedScreen';
	return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Screen';
}

function toFileName(title: string): string {
	return toComponentName(title).replace(/Screen$/, '') || 'Screen';
}
