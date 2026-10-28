export function GettingStartedPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Get started with @bareframe/react</h1>
				<p className="lead">
					Install the package, load theme CSS, and render accessible components driven by Bareframe tokens.
				</p>
			</div>

			<section className="doc-section card">
				<h2>Installation</h2>
				<pre className="code-block">{`npm install @bareframe/react
# peer: react & react-dom 18+`}</pre>
			</section>

			<section className="doc-section card">
				<h2>Themes</h2>
				<p>
					Import component styles once, then load a theme stylesheet from your app (or host the files from{' '}
					<code>/themes/*.css</code> in this repo):
				</p>
				<pre className="code-block">{`import '@bareframe/react/styles.css';
import '/themes/light.css';

// Optional: scope a subtree
// <div data-bf-theme="dark">...</div>`}</pre>
				<p>
					Legacy Repkit apps can keep using <code>--rk-*</code> variables — they alias to <code>--bf-theme-*</code>{' '}
					inside the package CSS.
				</p>
			</section>

			<section className="doc-section card">
				<h2>First component</h2>
				<pre className="code-block">{`import { Alert, Button } from '@bareframe/react';

export function WelcomeBanner() {
  return (
    <Alert variant="info" title="Welcome" action={<Button size="sm">Docs</Button>}>
      Bareframe components share tokens with Designer and MCP tools.
    </Alert>
  );
}`}</pre>
			</section>
		</>
	);
}
