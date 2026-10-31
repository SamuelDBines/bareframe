import { lazy, Suspense } from 'react';
import { DocSection, useDocPageToc } from './docs/DocsShell';

const CodeBlock = lazy(() => import('./docs/CodeBlock').then((m) => ({ default: m.CodeBlock })));

function LazyCode(props: { code: string; language?: string }) {
	return (
		<Suspense fallback={<pre className="docs-code-fallback">{props.code.trim()}</pre>}>
			<CodeBlock {...props} active />
		</Suspense>
	);
}

export function MigratingToReactPage() {
	useDocPageToc([
		{ id: 'package', label: 'Replace the package', depth: 2 },
		{ id: 'styles', label: 'Styles & themes', depth: 2 },
		{ id: 'imports', label: 'Component imports', depth: 2 },
		{ id: 'tokens', label: 'Repkit --rk-* tokens', depth: 2 },
		{ id: 'checklist', label: 'Checklist', depth: 2 },
	]);

	return (
		<>
			<header className="doc-page-header">
				<h1>Migrating to @bareframe/react</h1>
				<p className="doc-page-header__lead">
					Move from <code>@repkit/components</code>, a <code>repkit-components</code> checkout, or vendored
					Repkit copies. Same export names, Bareframe theme tokens, and optional <code>--rk-*</code>{' '}
					aliases.
				</p>
			</header>

			<DocSection id="package" title="Replace the package">
				<div className="doc-prose">
					<p>
						Swap the dependency, then install peers (React 18.3+ or 19). Use npm when published, or a
						tarball / <code>file:</code> path from this repo until then.
					</p>
				</div>
				<LazyCode
					code={`pnpm remove @repkit/components
pnpm add @bareframe/react react react-dom`}
					language="bash"
				/>
			</DocSection>

			<DocSection id="styles" title="Styles & themes">
				<div className="doc-prose">
					<p>Import component rules once, then a theme (order matters):</p>
				</div>
				<LazyCode
					code={`import '@bareframe/react/styles.css';
import '@bareframe/react/themes/light.css';
// or: import '@bareframe/react/theme.css';`}
				/>
			</DocSection>

			<DocSection id="imports" title="Component imports">
				<div className="doc-prose">
					<p>Update the package path — export names match for the React layer in this repo:</p>
				</div>
				<LazyCode
					code={`// Before
import { Button, Input, Modal } from '@repkit/components';

// After
import { Button, Input, Modal } from '@bareframe/react';`}
				/>
				<div className="doc-prose">
					<p>
						Supported exports include Alert, Badge, Button, Calendar, Card, DatePicker, form controls,
						Modal, Drawer, Select, Combobox, Tabs, Tooltip, and more — see{' '}
						<code>packages/react/src/index.ts</code> or MCP <code>list_components</code>.
					</p>
				</div>
			</DocSection>

			<DocSection id="tokens" title="Repkit --rk-* tokens">
				<div className="doc-prose">
					<p>
						<code>@bareframe/react/styles.css</code> defines legacy aliases such as{' '}
						<code>--rk-theme-surface-1</code> → <code>var(--bf-theme-surface-1)</code>. Existing app CSS
						that references <code>--rk-theme-*</code> keeps working once styles + a theme are imported.
					</p>
				</div>
			</DocSection>

			<DocSection id="checklist" title="Checklist">
				<ul className="doc-prose">
					<li>Remove Repkit package / path dependency</li>
					<li>Add @bareframe/react + React peers</li>
					<li>Import styles.css and one themes/*.css</li>
					<li>Replace import paths to @bareframe/react</li>
					<li>Run tests and visual QA on forms, modals, selects</li>
					<li>
						Use MCP <code>get_migration_guide</code> or the repo copy at{' '}
						<code>docs/MIGRATING-TO-BAREFRAME-REACT.md</code> for the full guide
					</li>
				</ul>
			</DocSection>
		</>
	);
}
