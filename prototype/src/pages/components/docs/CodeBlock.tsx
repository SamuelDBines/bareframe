import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../theme/ThemeContext';

type Props = {
	code: string;
	language?: string;
	active?: boolean;
	maxCollapsedLines?: number;
};

let languagesReady: Promise<void> | null = null;

async function ensurePrism() {
	if (!languagesReady) {
		languagesReady = import('prismjs').then(async (mod) => {
			const Prism = mod.default;
			(globalThis as typeof globalThis & { Prism?: typeof Prism }).Prism = Prism;
			await import('prismjs/components/prism-clike');
			await import('prismjs/components/prism-javascript');
			await import('prismjs/components/prism-bash');
		});
	}
	return languagesReady;
}

async function highlight(code: string, language: string): Promise<string> {
	await ensurePrism();
	const Prism = (await import('prismjs')).default;
	const grammar = language === 'bash' ? Prism.languages.bash : Prism.languages.javascript;
	return Prism.highlight(code, grammar, language === 'bash' ? 'bash' : 'javascript');
}

export function CodeBlock({
	code,
	language = 'tsx',
	active = true,
	maxCollapsedLines = 20,
}: Props) {
	const { theme } = useTheme();
	const dark = theme === 'dark' || theme === 'noir';
	const [html, setHtml] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(false);
	const lineCount = useMemo(() => code.split('\n').length, [code]);
	const collapsible = lineCount > maxCollapsedLines;

	useEffect(() => {
		if (!active) {
			setHtml(null);
			return;
		}
		let cancelled = false;
		highlight(code.trim(), language)
			.then((result) => {
				if (!cancelled) setHtml(result);
			})
			.catch(() => {
				if (!cancelled) setHtml(null);
			});
		return () => {
			cancelled = true;
		};
	}, [code, language, active]);

	return (
		<div className={`docs-code-wrap${dark ? ' docs-code-wrap--dark' : ''}`}>
			{collapsible && expanded ? (
				<div className="docs-code-wrap__actions">
					<button type="button" className="doc-ghost-btn" onClick={() => setExpanded(false)}>
						Show less
					</button>
				</div>
			) : null}
			{html ? (
				<pre
					className={`docs-code-block language-${language}${collapsible && !expanded ? ' is-collapsed' : ''}`}
				>
					<code dangerouslySetInnerHTML={{ __html: html }} />
				</pre>
			) : (
				<pre className={`docs-code-fallback${collapsible && !expanded ? ' is-collapsed' : ''}`}>
					{code.trim()}
				</pre>
			)}
			{collapsible && !expanded ? (
				<div style={{ padding: '0.35rem 0.75rem 0.65rem' }}>
					<button type="button" className="doc-ghost-btn" onClick={() => setExpanded(true)}>
						Show more ({lineCount} lines)
					</button>
				</div>
			) : null}
		</div>
	);
}
