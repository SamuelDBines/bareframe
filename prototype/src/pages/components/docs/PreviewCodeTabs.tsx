import { lazy, Suspense, useState, type ReactNode } from 'react';

const CodeBlockLazy = lazy(() =>
	import('./CodeBlock').then((m) => ({ default: m.CodeBlock })),
);

export function PreviewCodeTabs({
	preview,
	code,
	copyText,
}: {
	preview: ReactNode;
	code: string;
	copyText?: string;
}) {
	const [tab, setTab] = useState<'preview' | 'code'>('preview');
	const [copied, setCopied] = useState(false);
	const text = copyText ?? code;

	return (
		<div className="docs-tabs">
			<div className="docs-tabs__list" role="tablist" aria-label="Preview and code">
				<button
					type="button"
					role="tab"
					className="docs-tabs__tab"
					aria-selected={tab === 'preview'}
					onClick={() => setTab('preview')}
				>
					Preview
				</button>
				<button
					type="button"
					role="tab"
					className="docs-tabs__tab"
					aria-selected={tab === 'code'}
					onClick={() => setTab('code')}
				>
					Code
				</button>
				{tab === 'code' ? (
					<button
						type="button"
						className="doc-ghost-btn"
						style={{ marginLeft: '0.35rem' }}
						onClick={async () => {
							await navigator.clipboard.writeText(text.trim());
							setCopied(true);
							window.setTimeout(() => setCopied(false), 1500);
						}}
					>
						{copied ? 'Copied' : 'Copy'}
					</button>
				) : null}
			</div>
			<div className="docs-tabs__panel" role="tabpanel">
				{tab === 'preview' ? (
					preview
				) : (
					<Suspense fallback={<pre className="docs-code-fallback">{code.trim()}</pre>}>
						<CodeBlockLazy code={code} active />
					</Suspense>
				)}
			</div>
		</div>
	);
}