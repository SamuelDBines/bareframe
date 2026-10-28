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

export function GettingStartedPage() {
	useDocPageToc([
		{ id: 'install', label: 'Installation', depth: 2 },
		{ id: 'themes', label: 'Themes', depth: 2 },
		{ id: 'first', label: 'First component', depth: 2 },
	]);

	return (
		<>
			<header className="doc-page-header">
				<h1>Get started</h1>
				<p className="doc-page-header__lead">
					Install @bareframe/react, load theme CSS, and render accessible components driven by Bareframe tokens.
				</p>
			</header>

			<DocSection id="install" title="Installation">
				<LazyCode
					code={`npm install @bareframe/react
# peer: react & react-dom 18+`}
					language="bash"
				/>
			</DocSection>

			<DocSection id="themes" title="Themes">
				<div className="doc-prose">
					<p>
						Import component styles once, then load a theme stylesheet from your app (or host the files from{' '}
						<code>/themes/*.css</code> in this repo):
					</p>
				</div>
				<LazyCode
					code={`import '@bareframe/react/styles.css';
import '/themes/light.css';

// Optional: scope a subtree
// <div data-bf-theme="dark">...</div>`}
				/>
				<div className="doc-prose">
					<p>
						Legacy Repkit apps can keep using <code>--rk-*</code> variables — they alias to{' '}
						<code>--bf-theme-*</code> inside the package CSS.
					</p>
				</div>
			</DocSection>

			<DocSection id="first" title="First component">
				<LazyCode
					code={`import { Alert, Button } from '@bareframe/react';

export function WelcomeBanner() {
  return (
    <Alert variant="info" title="Welcome" action={<Button size="sm">Docs</Button>}>
      Bareframe components share tokens with Designer and MCP tools.
    </Alert>
  );
}`}
				/>
			</DocSection>
		</>
	);
}
